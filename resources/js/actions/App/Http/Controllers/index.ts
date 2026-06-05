import Webhooks from './Webhooks'
import Api from './Api'
import Web from './Web'
import Settings from './Settings'
import Admin from './Admin'

const Controllers = {
    Webhooks: Object.assign(Webhooks, Webhooks),
    Api: Object.assign(Api, Api),
    Web: Object.assign(Web, Web),
    Settings: Object.assign(Settings, Settings),
    Admin: Object.assign(Admin, Admin),
}

export default Controllers