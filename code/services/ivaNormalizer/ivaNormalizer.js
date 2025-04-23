/**
 * @param {CbServer.BasicReq} req
 * @param {CbServer.Resp} resp
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function ivaNormalizer(req, resp) {
  const client = new MQTT.Client();

  const INCOMING_TOPIC = 'ivanormalizer/data';
  const SHARED_TOPIC = '$share/normalizerDefaultMQTT/' + INCOMING_TOPIC;
  const DEFAULT_GROUP = 'default';
  const DEFAULT_ASSET_TYPE = 'default';

  const topics = [SHARED_TOPIC].concat(!cbmeta.is_edge ? [SHARED_TOPIC + '/_platform'] : []);
  /** @type {import('@ia/common/misc/normalizer').NormalizerPublishConfig} */
  const publishConfig = createPublishConfig();

  const targetsCol = ClearBladeAsync.Collection('rtsp_targets');

  try {
    console.debug('Starting normalizer');
    /** @type {import('../../../backend/Normalizer').MessageParser} */
    const messageParser = function (_topic, messagePayload) {
      const view = new DataView(messagePayload.buffer); 
      const metaDataLength = view.getInt32();

      const metaData = new TextDecoder("utf-8").decode(messagePayload.buffer.slice(4, 4 + metaDataLength))
      const metaDataObj = JSON.parse(metaData);

      var imageStart = 4 + metaDataLength;
      var imageBytes = new Uint8Array(messagePayload.buffer.slice(imageStart));
      const imageBase64 = bufferToBase64(imageBytes.buffer);

      var incomingData = metaDataObj
      incomingData['frame'] = imageBase64;

      if (!(incomingData instanceof Array)) {
        console.log('Is not instance of an array...');
        incomingData = [incomingData];
      }

      // Map incoming data payload to asset attributes
      return mapDataToAttributes(incomingData).then(function(mappedPayloads) {
        const records = processIncomingRecords(mappedPayloads, DEFAULT_ASSET_TYPE, DEFAULT_GROUP);
        // Process the incoming records
        if (records.length == 0) {
          throw new Error('No data in incoming payload to normalize.');
        }
        return records;
      })
    };
    normalizer(
      {
        req,
        resp,
        messageParser,
        topics,
        normalizerPubConfig: publishConfig,
      },
      req.service_instance_id,
      client
    );
  } catch (err) {
    console.error('Error starting normalizer', getErrorMessage(err));
    resp.error('Error starting normalizer: ' + getErrorMessage(err));
  }

  /**
   * @returns {import('@ia/common/misc/normalizer').NormalizerPublishConfig}
   */
  function createPublishConfig() {
    return {
      locationAndStatusConfig: createLocationAndStatusConfig(),
    };
  }

  /**
   * @returns {import('@ia/common/misc/normalizer').PublishConfig}
   */
  function createLocationAndStatusConfig() {
    return {
      topicFn: function (ASSETID) {
        return '_dbupdate/_monitor/_asset/' + ASSETID + '/locStatusHistory/_platform';
      },
      keysToPublish: [
        'id',
        'type',
        'custom_data',
        'last_location_updated',
        'last_updated',
        'latitude',
        'longitude',
        'group_id',
        'label',
        'group_ids',
        'floor_levels',
        'attributes_labels',
        'tags',
      ],
    };
  }

  /**
   * @param {Array<Partial<import('@ia/common/collection-types/asset').Asset['frontend_create']>> | Partial<import('@ia/common/collection-types/asset').Asset['frontend_create']>} incomingRecords
   * @param {string} assetType
   * @param {string} groupId
   * @returns {Array<Partial<import('@ia/common/collection-types/asset').Asset['frontend_create']>>}
   */
  function processIncomingRecords(incomingRecords, assetType, groupId) {
    // Data will contain an array of records. The data in each record
    // will need to be normalized
    const now = new Date().toISOString();

    return incomingRecords.reduce(
      /**
       *
       * @param {Array<Partial<import('@ia/common/collection-types/asset').AssetWithGroups['frontend_create']>>} result
       * @param {Partial<import('@ia/common/collection-types/asset').AssetWithGroups['frontend_create']>} rec
       * @returns {Array<Partial<import('@ia/common/collection-types/asset').Asset['frontend_create']>>}
       */
      function (result, rec) {
        if (!rec.id) {
          console.error('Incoming Message is missing ID: ', rec);
          return result;
        }
        // Include last_location_updated if location has actually changed
        if (rec.latitude && rec.longitude) {
          rec.last_location_updated = rec.last_location_updated ? rec.last_location_updated : now;
        }

        rec.last_updated = rec.last_updated ? rec.last_updated : now;
        rec.type = rec.type ? rec.type : assetType;

        rec.group_ids = rec.group_ids ? rec.group_ids : [rec.group_id ? rec.group_id : groupId];
        result.push(rec);
        return result;
      },
      []
    );
  }

  /**
   * @param {Array<Partial<import('@ia/common/collection-types/asset').Asset['frontend_create']>> | Partial<import('@ia/common/collection-types/asset').Asset['frontend_create']>} incomingData
   * @returns {Promise<Array<Partial<import('@ia/common/collection-types/asset').Asset['frontend_create']>>>}
   */
  function mapDataToAttributes(incomingData) {
    return Promise.all(incomingData.map(function(data) {
      const camera_id = data['device_id'];
      const task_id = data['task_id'];
      const task_uuid = data['uuid']
      const task_output = data[task_id + '_output'];

      if (data['frame']) {  
        task_output['frame'] = 'data:image/jpeg;base64,' + data['frame'];
      }

      const query = ClearBladeAsync.Query().equalTo('device_id', camera_id).equalTo('task_uuid', task_uuid).equalTo('target_id', 'ia')

      return targetsCol.fetch(query).then(function(results){
        if (results.TOTAL === 0) {
          // no mappings found for given task_uuid and device_id
          return [];
        }

        const mappings = results.DATA[0]['mappings'];
        const normalizerPayload = {};

        mappings.forEach(function(mapping) {
          const assetId = mapping.target_asset.id;
          const attributeId = mapping.target_attribute.id;

          if (!assetId || !attributeId) return;

          if (!normalizerPayload[assetId]) {
            normalizerPayload[assetId] = [];
          }
          normalizerPayload[assetId].push(mapping);
        });
        return Object.keys(normalizerPayload).map(function(assetId) {
          var mappings = normalizerPayload[assetId];
          const custom_data = {};
          
          mappings.forEach(function(mapping) {
            const deviceOutputId = mapping.device_output.id;
            const targetAttributeId = mapping.target_attribute.id;
            if (!targetAttributeId) return;
            custom_data[targetAttributeId] = task_output[deviceOutputId];
          });

          return {
            id: assetId,
            custom_data
          };
        });
      });
    })).then(function(payload){
      return payload.reduce(function (result, rec) {
        rec.forEach(function(r) {
          result.push(r);
        })
        return result;
      }, [])
    }).catch(function(err) {
      return Promise.reject(err);
    });
  }

  function btoaPolyfill(binary) {
    var base64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var base64 = "";
    var padding = "";
    var i;

    for (i = 0; i < binary.length % 3; ++i) {
      padding += "=";
      binary += "\0";
    }

    for (i = 0; i < binary.length; i += 3) {
      var n = (binary.charCodeAt(i) << 16) |
              (binary.charCodeAt(i + 1) << 8) |
              binary.charCodeAt(i + 2);

      base64 += base64chars[(n >>> 18) & 63] +
                base64chars[(n >>> 12) & 63] +
                base64chars[(n >>> 6) & 63] +
                base64chars[n & 63];
    }

    return base64.substring(0, base64.length - padding.length) + padding;
  }

  function bufferToBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    for (var i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoaPolyfill(binary);
  } 
}

/**
 *
 * @param {import('../../../backend/Normalizer').NormalizerConfig} config
 * @param {string} service_instance_id
 * @param {CbServer.MQTTClient} client
 */
function normalizer(config, service_instance_id, client) {
  const topics = config.topics;
  const normalizerPubConfig = config.normalizerPubConfig;
  const messageParser = config.messageParser;

  console.debug('Normalizer SERVICE_INSTANCE_ID: ' + service_instance_id);

  topics.forEach(function (topic) {
    client.subscribe(topic, handleMessage).catch(function (err) {
      console.log('Subscription error', err);
      throw new Error('Error subscribing to topic');
    });
  });

  /**
   *
   * @param {string} topic
   * @param {CbServer.MQTTMessage} message
   */
  function handleMessage(topic, message) {
    const value = messageParser(topic, message.payload_bytes);
    if (value instanceof Promise) {
      value
        .then(function (assets) {
          return bulkPublisher(assets, normalizerPubConfig, client);
        })
        .catch(function (err) {
          console.error('An error has occurred: ' + getErrorMessage(err));
        });
    } else {
      if (value) {
        bulkPublisher(value, normalizerPubConfig, client);
      }
    }
  }

  /**
   * @param {unknown} error
   * @returns {error is ErrorWithMessage}
   */
  function isErrorWithMessage(error) {
    return typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string';
  }
  
  /**
   *
   * @param {unknown} maybeError
   * @returns {ErrorWithMessage}
   */
  function toErrorWithMessage(maybeError) {
    if (isErrorWithMessage(maybeError)) return maybeError;
  
    try {
      return new Error(JSON.stringify(maybeError));
    } catch (e) {
      // fallback in case there's an error stringifying the maybeError
      // like with circular references for example.
      return new Error(String(maybeError));
    }
  }

  function getErrorMessage(error) {
    return toErrorWithMessage(error).message;
  }

  function bulkPublisher(assets, normalizerPubConfig, client) {
    Object.keys(normalizerPubConfig).forEach(function (key) {
      const pubConfigClient = normalizerPubConfig[key].client;
      const mqttClient = pubConfigClient ? pubConfigClient : client;
      publisher(assets, normalizerPubConfig[key], mqttClient);
    });
  }
  
  /**
   *
   * @param {Array<Partial<import('@ia/common/collection-types/asset').Asset['frontend_create']>>} assets
   * @param {import('@ia/common/misc/normalizer').PublishConfig} pubConfig
   * @param {CbServer.MQTTClient} client
   */
  function publisher(assets, pubConfig, client) {
    if (pubConfig.batchPublish) {
      // In case assets contains multiple asset id's.
      const topicBatches = assets.reduce(
        /**
         *
         * @param {{ [topic: string]: Record<string, unknown>[] }} acc
         * @param {Partial<import('@ia/common/collection-types/asset').Asset['frontend_create']>} asset
         * @returns
         */
        function (acc, asset) {
          if (typeof pubConfig.shouldPublishAsset === 'undefined' || pubConfig.shouldPublishAsset(asset)) {
            const topic = pubConfig.topicFn(/** @type {string} */ (asset.id));
            const pubData = pubConfig.keysToPublish.reduce(function (acc, key) {
              acc[key] =
                asset[
                  /** @type {keyof Partial<import('@ia/common/collection-types/asset').Asset['frontend_create']>} */ (key)
                ];
              return acc;
            }, /** @type {Record<string, unknown>} */ ({}));
  
            if (acc[topic]) {
              acc[topic].push(pubData);
            } else {
              acc[topic] = [pubData];
            }
          }
          return acc;
        },
        {}
      );
      Object.keys(topicBatches).forEach(function (topic) {
        void client.publish(topic, JSON.stringify(topicBatches[topic]));
      });
    } else {
      assets.forEach(function (asset) {
        const topic = pubConfig.topicFn(/** @type {string} */ (asset.id));
        /** @type {Record<string, unknown>} */
        const pubData = {};
        if (typeof pubConfig.shouldPublishAsset === 'undefined' || pubConfig.shouldPublishAsset(asset)) {
          pubConfig.keysToPublish.forEach(function (key) {
            pubData[key] =
              asset[
                /** @type {keyof Partial<import('@ia/common/collection-types/asset').Asset['frontend_create']>} */ (key)
              ];
          });
          void client.publish(topic, JSON.stringify(pubData));
        }
      });
    }
  }  
}
