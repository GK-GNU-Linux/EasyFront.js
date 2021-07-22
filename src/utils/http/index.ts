export default class httpUtils {
    EFajax(url: string, method: string = "GET", data: string = null):Promise<string> {
        let pro = new Promise<string>(function(resolve, reject) {
            let ajax = new XMLHttpRequest()
            ajax.open(method, url)
            ajax.send(data)
            ajax.onreadystatechange = () => {
                if (ajax.readyState == 4 && ajax.status == 200) {
                    resolve(ajax.responseText)
                }
            }
            setTimeout(() => {
                reject("EasyFront[ERROR]: 请求服务器失败。")
            }, 1000)
        })
        return pro
    }
}