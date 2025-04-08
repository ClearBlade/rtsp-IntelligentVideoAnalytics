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

function rtsp_getEdges(req, resp) {
  console.log(req);
  const url = 'https://' + cbmeta.platform_url + '/api/v/2/edges/' + cbmeta.system_key;

  fetch(url, {
    method: 'GET',
    headers: {
      'clearblade-devtoken': req.userToken,
    }
  }).then(function(response) {
    if (!response.ok) {
      console.log(response.text());
      resp.error({error: response.statusText})
    }
    return response.json();
  }).then(resp.success).catch(resp.error);
}