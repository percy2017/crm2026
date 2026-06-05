import AdminDashboardController from './AdminDashboardController'
import AdminUserController from './AdminUserController'
import AdminRoleController from './AdminRoleController'
import AdminDealController from './AdminDealController'
import AdminPipelineStageController from './AdminPipelineStageController'
import InboxCrudController from './InboxCrudController'
import AdminEntradaController from './AdminEntradaController'
import AdminMediaController from './AdminMediaController'
import AdminCronJobController from './AdminCronJobController'
import AdminQuickReplyController from './AdminQuickReplyController'
import AdminWooCommerceController from './AdminWooCommerceController'
import AdminAiAgentController from './AdminAiAgentController'
import AdminContactController from './AdminContactController'

const Admin = {
    AdminDashboardController: Object.assign(AdminDashboardController, AdminDashboardController),
    AdminUserController: Object.assign(AdminUserController, AdminUserController),
    AdminRoleController: Object.assign(AdminRoleController, AdminRoleController),
    AdminDealController: Object.assign(AdminDealController, AdminDealController),
    AdminPipelineStageController: Object.assign(AdminPipelineStageController, AdminPipelineStageController),
    InboxCrudController: Object.assign(InboxCrudController, InboxCrudController),
    AdminEntradaController: Object.assign(AdminEntradaController, AdminEntradaController),
    AdminMediaController: Object.assign(AdminMediaController, AdminMediaController),
    AdminCronJobController: Object.assign(AdminCronJobController, AdminCronJobController),
    AdminQuickReplyController: Object.assign(AdminQuickReplyController, AdminQuickReplyController),
    AdminWooCommerceController: Object.assign(AdminWooCommerceController, AdminWooCommerceController),
    AdminAiAgentController: Object.assign(AdminAiAgentController, AdminAiAgentController),
    AdminContactController: Object.assign(AdminContactController, AdminContactController),
}

export default Admin