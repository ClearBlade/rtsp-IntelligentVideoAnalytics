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

/*
curl -X POST 'https://localhost.clearblade.com/api/v/4/webhook/execute/8aee9cfa0ce0bc82bfc0e985ec13/manageStreams' -H 'clearblade-devtoken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOi0xLCJpYXQiOjE3MzkyMjU2NTgsInNpZCI6ImU2OWMxMmM4LTRkYzctNGJiMi04NjRmLTNiMjRhNjU4MDRmNyIsInR0IjoxLCJ1aWQiOiJkOGVlYzRlNTBjZjI4MGUwYjJiZGFkZTc5NGQ3MDEiLCJ1dCI6MX0.SqslKaD2hISn9-EkrCTR125nL3IQ8mxAxY33F6lRD4o' -H 'clearblade-edge: ivaEdge1' -H 'clearblade-systemkey: 8aee9cfa0ce0bc82bfc0e985ec13' --data-raw '{"action": "stop_stream", "body": {"camera_id": "camera_1", "camera_url": "/Users/rajas/Desktop/developer/Object Detection/IMG_9322.MP4"}}'
*/

function manageStreams(req, resp) {

  if (!cbmeta.is_edge) {
    resp.error({error: true, message: "Service called on platform and not on edge"})
  }

  const BASE_URL = "http://127.0.0.1:5001";
  const p = req.params.body
  const action = p.action;
  const body = p.body;

  function sendRequest(url, method, body, qs) {
    const options = {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: null
    }

    if (body) options.body = JSON.stringify(body);
    if (qs) url = url + '?' + qs
    
    return fetch(url, options).then(function(result){
      if (!result.ok) {
        return {error: true, message: result.text()}
      }
      return {error: false, message: result.json()};
    }).then(function(result){
      if (result.error) {
        return Promise.reject(result.message)
      }
      return Promise.resolve(result.message);
    }).catch(function(err){
      return Promise.reject(err);
    })
  }

  function jsonToQueryString(json) {
    var queryString = [];
    for (var key in json) {
        if (json.hasOwnProperty(key)) {
            queryString.push(encodeURIComponent(key) + "=" + encodeURIComponent(json[key]));
        }
    }
    return queryString.join("&");
  }

  switch (action) {
    case 'start_stream': {
      const url = BASE_URL + "/stream/start"
      sendRequest(url, 'POST', body).then(resp.success).catch(resp.error)
      break;
    }

    case 'stop_stream': {
      const url = BASE_URL + "/stream/stop"
      sendRequest(url, 'POST', body).then(resp.success).catch(resp.error)      
      break;
    }

    case 'restart_stream': {
      const url = BASE_URL + "/stream/restart"
      sendRequest(url, 'POST', body).then(resp.success).catch(resp.error)      
      break;
    }

    case 'add_stream_tasks': {
      const url = BASE_URL + "/stream/tasks"
      sendRequest(url, 'POST', body).then(resp.success).catch(resp.error)      
      break;
    }

    case 'get_stream_status': {
      const url = BASE_URL + "/stream/status"
      sendRequest(url, 'GET', null, jsonToQueryString(body)).then(resp.success).catch(resp.error)      
      break;
    }

    case 'get_stream_image': {
      const url = BASE_URL + "/stream/image"
      sendRequest(url, 'GET', null, jsonToQueryString(body)).then(resp.success).catch(resp.error)      
      break;
    }

    case 'get_stream_tasks': {
      const url = BASE_URL + "/stream/tasks"
      sendRequest(url, 'GET', null, jsonToQueryString(body)).then(resp.success).catch(resp.error)      
      break;
    }

    case 'get_task_status': {
      const url = BASE_URL + "/tasks/status"
      sendRequest(url, 'GET', null, jsonToQueryString(body)).then(resp.success).catch(resp.error)      
      break;
    }

    case 'update_task': {
      const url = BASE_URL + "/tasks/update"
      sendRequest(url, 'POST', body).then(resp.success).catch(resp.error)      
      break;
    }

    case 'check_adapter_status': {
      const url = BASE_URL + "/status"
      sendRequest(url, 'GET', null).then(resp.success).catch(resp.error)      
      break;
    }

    default:
      resp.error('Undefined action: ' + action);
  }
}
