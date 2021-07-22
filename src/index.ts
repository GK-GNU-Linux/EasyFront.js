import EFVal from './components/val'
import EFFor from './components/for'
import EFRequest from './components/request'
class EasyFront {
    EFVal: EFVal
    EFFor: EFFor
    EFRequest: EFRequest
    constructor() {
        this.EFVal = new EFVal()
        this.EFFor = new EFFor(this)
        this.EFRequest = new EFRequest(this)
    }
}
window['EasyFront'] = new EasyFront()