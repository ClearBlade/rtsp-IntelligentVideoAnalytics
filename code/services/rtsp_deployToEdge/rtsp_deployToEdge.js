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

function rtsp_deployToEdge(req, resp) {
  const params = req.params;
  const edge = params.body.edge;
  const url = cbmeta.platform_url;
  const systemKey = cbmeta.system_key;
  const deploymentName = 'iva';

  if (!edge) {
    resp.error("Edge is required for deployment");
  }

  function checkDeploymentStatus() {
    return fetch('https://' + url + '/admin/' + systemKey + '/deployments/' + deploymentName, {
      method: 'GET',
      headers: {
        'Clearblade-DevToken': req.userToken,
        'Content-Type': 'application/json',
      },
    }).then(function(response) {
       if (!response.ok) {
         const message = 'Error checking deployment status: ' + response.statusText();
         return Promise.reject(message)
      }
      return response.json();
    }).then(function(data){
      return data.edges.indexOf(edge) !== -1;
    });
  }

  function addDeploymentToEdge() {
    return fetch('https://' + url + '/admin/' + systemKey + '/deployments/' + deploymentName, {
      method: 'PUT',
      headers: {
        'Clearblade-DevToken': req.userToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assets: { add: [], remove: [] }, edges: { add: [edge], remove: [] } }),
    }).then(function(response) {
       if (!response.ok) {
         const message = 'Failed to add deployment to edge: ' + response.statusText();
         return Promise.reject(message)
      }
      return response.json();
    }).then(function(data){
      return data.edges.indexOf(edge) !== -1;
    });
  }

  function checkAdapterStatus() {
    sleep(10000);
    return fetch('https://' + url + '/api/v/4/webhook/execute/' + systemKey + '/manageStreams', {
      method: 'POST',
      headers: {
        'clearblade-edge': edge,
        'clearblade-systemkey': systemKey, 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "action": "check_adapter_status"
      })
    }).then(function(response){
      return response.json();
    }).then(function(data){
      if (!data.success) {
        return Promise.reject(data.results);
      }
      return data.results.is_adapter_connected;
    }).catch(function(error){
      return Promise.reject(error)
    });
  }

  checkDeploymentStatus()
    .then(function(isDeployed){
      console.log('isDeployed: ', isDeployed);
      if (!isDeployed) {
        return addDeploymentToEdge();
      }
    }).then(function(){
      return checkAdapterStatus();
    }).then(function(isAdapterOnline){
      if (!isAdapterOnline) {
        resp.error('Adapter is not connected')
      }
      resp.success('Deployment and adapter connection successful')
    }).catch(function(err){
      resp.error(err);
    })

}
