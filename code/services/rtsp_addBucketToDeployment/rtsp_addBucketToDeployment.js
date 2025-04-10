/**
 * Type: Micro Service
 * Description: A short-lived service which is expected to complete within a fixed period of time.
 * @param {CbServer.BasicReq} req
 * @param {string} req.systemKey
 * @param {string} req.systemSecret
 * @param {string} req.userEmail
 * @param {string} req.userid
 * @param {string} req.userToken
 * @param {boolean} req.isLogging
 * @param {[id: string]} req.params
 * @param {CbServer.Resp} resp
 */

function rtsp_addBucketToDeployment(req, resp) {
  const params = req.params;

  if (!params.body) {
    resp.error("body missing: expected edge and bucket set info");
  }

  const edge = params.body.edge;
  const bucketSet = params.body.bucketSet; // {id: "", path: ""};
  const url = cbmeta.platform_url;
  const systemKey = cbmeta.system_key;
  const deploymentName = 'bsSync';
  
  if (!bucketSet || bucketSet.id === "") {
    resp.success("no bucket set found to deploy");
  }


  function checkIfBucketDeployedToEdge() {
    return fetch("https://" + url + "/admin/" + systemKey + "/deployments/" + deploymentName, {
      "headers": {
        "Clearblade-DevToken": req.userToken,
        "Content-Type": "application/json",
      },
      "method": "GET"
    }).then(function(response) {
       if (!response.ok) {
         const message = "Error checking if bucket '" + bucketSet.id + "' is deployed to deployment: '" + deploymentName + "': " + response.statusText();
         return Promise.reject(message)
      }
      return response.json();
    }).then(function(data){
      const assets = data.assets;
      const edges = data.edges;

      if (edges.indexOf(edge) === -1) {
        const message = "Error: Deployment '" + deploymentName + "' is not added to edge: '" + edge + "'";
        return Promise.reject(message);
      }

      const bucketAsset = assets.filter(function(a) {
        return a.asset_class === "bucketsets" && a.asset_id === bucketSet.id
      })
      return bucketAsset.length !== 0;
    });
  }

  function addBucketToDeployment() {
    return fetch("https://" + url + "/admin/" + systemKey + "/deployments/" + deploymentName, {
      "method": "PUT",
      "headers": {
        'Clearblade-DevToken': req.userToken,
        'Content-Type': 'application/json',
      },
      "body": JSON.stringify({
        "assets": {
          "add": [
            {
                "asset_class": "bucketsets",
                "asset_id": bucketSet.id,
                "sync_to_edge": true,
                "sync_to_platform": false
            }
          ],
          "remove": []
        },
        "edges": {
          "add": [],
          "remove": []
        }
      }),
    }).then(function(response) {
       if (!response.ok) {
         const message = 'Error deploying bucket to deployment: ' + response.statusText();
         return Promise.reject(message)
      }
      return response.json();
    });
  }

  checkIfBucketDeployedToEdge().then(function(isBucketDeployToEdge) {
    if (isBucketDeployToEdge) {
      const message = "Bucket set '" + bucketSet.id + "' already added to deployment '" + deploymentName + "'"
      resp.success(message);
    }
    return addBucketToDeployment();
  }).then(function(result){
    const message = "Added Bucket set '" + bucketSet.id + "' to deployment '" + deploymentName + "'"    
    resp.success(message);
  }).catch(function(err) {
    resp.error(err);
  });
}
