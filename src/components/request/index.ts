import httpUtils from '../../utils/http'
export default class httpEngine {
    easyFront: any = {}
    constructor(father) {
        this.easyFront = father
        this.makeRequest()
    }
    async makeRequest() {
        let reqs = this.easyFront.EFVal.readSkeleton('request')
        for (const req of reqs) {
            let url = req.getAttribute("e-url")
            let method = req.getAttribute("e-method")
            let data = req.getAttribute("e-req-data")
            let model = req.getAttribute("e-model")
            let callback = req.getAttribute("e-callback")
            if(method == "GET" || method == "get") {
                url = url + data
            }
            let res = await new httpUtils().EFajax(url, method, data)
            res = JSON.parse(res)
            let cb = new Function('res', "return " + callback)
            let cbRes =cb(res)
            this.easyFront.EFVal.data[model] = cbRes
        }
    }
}