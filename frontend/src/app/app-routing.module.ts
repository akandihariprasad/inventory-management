import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout';
import { LandingComponent } from './modules/landing/landing';
import { DashboardComponent } from './modules/dashboard/dashboard';
import { LoginComponent } from './modules/auth/login/login';
import { RegisterOwnerComponent } from './modules/auth/register-owner/register-owner';
import { RegisterSupplierComponent } from './modules/auth/register-supplier/register-supplier';
import { SetPasswordComponent } from './modules/auth/set-password/set-password';
import { ProfileComponent } from './modules/company/profile/profile';
import { DepartmentsComponent } from './modules/company/departments/departments';
import { StaffListComponent } from './modules/staff/staff-list/staff-list';
import { InviteStaffComponent } from './modules/staff/invite-staff/invite-staff';
import { SupplierListComponent } from './modules/supplier/supplier-list/supplier-list';
import { SupplierCatalogComponent } from './modules/supplier/supplier-catalog/supplier-catalog';
import { SupplierProductsComponent } from './modules/supplier/supplier-products/supplier-products';
import { SupplierConnectionsComponent } from './modules/supplier/supplier-connections/supplier-connections';
import { PurchaseListComponent } from './modules/purchase/purchase-list/purchase-list';
import { CreatePurchaseComponent } from './modules/purchase/create-purchase/create-purchase';
import { PurchaseDetailComponent } from './modules/purchase/purchase-detail/purchase-detail';
import { ProductListComponent } from './modules/inventory/product-list/product-list';
import { AddProductComponent } from './modules/inventory/add-product/add-product';
import { StockMovementsComponent } from './modules/inventory/stock-movements/stock-movements';
import { SaleListComponent } from './modules/sales/sale-list/sale-list';
import { CustomerListComponent } from './modules/sales/customer-list/customer-list';
import { CreateSaleComponent } from './modules/sales/create-sale/create-sale';
import { InvoiceComponent } from './modules/sales/invoice/invoice';
import { DashboardReportComponent } from './modules/reports/dashboard/dashboard';
import { InventoryReportComponent } from './modules/reports/inventory-report/inventory-report';
import { SalesReportComponent } from './modules/reports/sales-report/sales-report';
import { SupplierApprovalComponent } from './modules/admin/supplier-approval/supplier-approval';
import { ChangePasswordComponent } from './modules/profile/change-password/change-password';
import { SupplierProductFormComponent } from './modules/supplier/supplier-product-form/supplier-product-form';
import { SupplierStockMovementsComponent } from './modules/supplier/supplier-stock-movements/supplier-stock-movements';
import { SupplierCustomersComponent } from './modules/supplier/supplier-customers/supplier-customers';
import { SupplierSalesReportComponent } from './modules/supplier/supplier-sales-report/supplier-sales-report';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

const supplierRoles = ['SUPPLIER'];
const ownerAdminRoles = ['OWNER', 'ADMIN'];
const ownerAdminManagerRoles = ['OWNER', 'ADMIN', 'MANAGER'];
const staffAccessRoles = ['OWNER', 'ADMIN', 'MANAGER', 'WORKER'];

const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: AuthLayoutComponent, children: [{ path: '', component: LoginComponent }] },
  { path: 'register/owner', component: AuthLayoutComponent, children: [{ path: '', component: RegisterOwnerComponent }] },
  { path: 'register/supplier', component: AuthLayoutComponent, children: [{ path: '', component: RegisterSupplierComponent }] },
  { path: 'set-password', component: AuthLayoutComponent, children: [{ path: '', component: SetPasswordComponent }], canActivate: [AuthGuard] },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },

      { path: 'company/profile', component: ProfileComponent, canActivate: [RoleGuard], data: { roles: ownerAdminRoles } },
      { path: 'company/departments', component: DepartmentsComponent, canActivate: [RoleGuard], data: { roles: ownerAdminRoles } },

      { path: 'staff', component: StaffListComponent, canActivate: [RoleGuard], data: { roles: ownerAdminManagerRoles } },
      { path: 'staff/invite', component: InviteStaffComponent, canActivate: [RoleGuard], data: { roles: ownerAdminRoles } },

      { path: 'suppliers', component: SupplierListComponent, canActivate: [RoleGuard], data: { roles: ownerAdminManagerRoles } },
      { path: 'suppliers/catalog/:id', component: SupplierCatalogComponent, canActivate: [RoleGuard], data: { roles: ownerAdminManagerRoles } },

      { path: 'supplier/products', component: SupplierProductsComponent, canActivate: [RoleGuard], data: { roles: supplierRoles } },
      { path: 'supplier/products/add', component: SupplierProductFormComponent, canActivate: [RoleGuard], data: { roles: supplierRoles } },
      { path: 'supplier/products/edit/:id', component: SupplierProductFormComponent, canActivate: [RoleGuard], data: { roles: supplierRoles } },
      { path: 'supplier/stock-movements', component: SupplierStockMovementsComponent, canActivate: [RoleGuard], data: { roles: supplierRoles } },
      { path: 'supplier/connections', component: SupplierConnectionsComponent, canActivate: [RoleGuard], data: { roles: supplierRoles } },
      { path: 'supplier/customers', component: SupplierCustomersComponent, canActivate: [RoleGuard], data: { roles: supplierRoles } },
      { path: 'supplier/purchase-requests', component: PurchaseListComponent, canActivate: [RoleGuard], data: { roles: supplierRoles } },
      { path: 'supplier/sales-report', component: SupplierSalesReportComponent, canActivate: [RoleGuard], data: { roles: supplierRoles } },
      { path: 'supplier/inventory-report', component: InventoryReportComponent, canActivate: [RoleGuard], data: { roles: supplierRoles } },

      { path: 'admin/supplier-approval', component: SupplierApprovalComponent, canActivate: [RoleGuard], data: { roles: ['SUPER_ADMIN'] } },

      { path: 'purchase-requests', component: PurchaseListComponent, canActivate: [RoleGuard], data: { roles: ownerAdminRoles } },
      { path: 'purchase-requests/create', component: CreatePurchaseComponent, canActivate: [RoleGuard], data: { roles: ownerAdminRoles } },
      { path: 'purchase-requests/:id', component: PurchaseDetailComponent, canActivate: [RoleGuard], data: { roles: [...ownerAdminRoles, ...supplierRoles] } },

      { path: 'inventory', component: ProductListComponent, canActivate: [RoleGuard], data: { roles: staffAccessRoles } },
      { path: 'inventory/add', component: AddProductComponent, canActivate: [RoleGuard], data: { roles: ownerAdminManagerRoles } },
      { path: 'inventory/edit/:id', component: AddProductComponent, canActivate: [RoleGuard], data: { roles: ownerAdminManagerRoles } },
      { path: 'inventory/movements', component: StockMovementsComponent, canActivate: [RoleGuard], data: { roles: staffAccessRoles } },

      { path: 'sales', component: SaleListComponent, canActivate: [RoleGuard], data: { roles: staffAccessRoles } },
      { path: 'sales/customers', component: CustomerListComponent, canActivate: [RoleGuard], data: { roles: staffAccessRoles } },
      { path: 'sales/create', component: CreateSaleComponent, canActivate: [RoleGuard], data: { roles: staffAccessRoles } },
      { path: 'sales/invoice/:id', component: InvoiceComponent, canActivate: [RoleGuard], data: { roles: staffAccessRoles } },

      { path: 'reports/dashboard', component: DashboardReportComponent, canActivate: [RoleGuard], data: { roles: ownerAdminManagerRoles } },
      { path: 'reports/inventory', component: InventoryReportComponent, canActivate: [RoleGuard], data: { roles: ownerAdminManagerRoles } },
      { path: 'reports/sales', component: SalesReportComponent, canActivate: [RoleGuard], data: { roles: ownerAdminManagerRoles } },

      { path: 'change-password', component: ChangePasswordComponent },
      { path: 'profile', component: ProfileComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
