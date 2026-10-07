







import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrModule } from 'ngx-toastr';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';

import { AppComponent } from './app';
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

// Import all components (they are NOT standalone now)
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
import { SupplierProductFormComponent } from './modules/supplier/supplier-product-form/supplier-product-form';
import { SupplierStockMovementsComponent } from './modules/supplier/supplier-stock-movements/supplier-stock-movements';
import { SupplierCustomersComponent } from './modules/supplier/supplier-customers/supplier-customers';
import { SupplierSalesReportComponent } from './modules/supplier/supplier-sales-report/supplier-sales-report';
import { PurchaseListComponent } from './modules/purchase/purchase-list/purchase-list';
import { CreatePurchaseComponent } from './modules/purchase/create-purchase/create-purchase';
import { PurchaseDetailComponent } from './modules/purchase/purchase-detail/purchase-detail';
import { ProductListComponent } from './modules/inventory/product-list/product-list';
import { AddProductComponent } from './modules/inventory/add-product/add-product';
import { StockMovementsComponent } from './modules/inventory/stock-movements/stock-movements';
import { CustomerListComponent } from './modules/sales/customer-list/customer-list';
import { CreateSaleComponent } from './modules/sales/create-sale/create-sale';
import { SaleListComponent } from './modules/sales/sale-list/sale-list';
import { InvoiceComponent } from './modules/sales/invoice/invoice';
import { DashboardReportComponent } from './modules/reports/dashboard/dashboard';
import { InventoryReportComponent } from './modules/reports/inventory-report/inventory-report';
import { SalesReportComponent } from './modules/reports/sales-report/sales-report';
import { SupplierApprovalComponent } from './modules/admin/supplier-approval/supplier-approval';
import { ChangePasswordComponent } from './modules/profile/change-password/change-password';

@NgModule({
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    AuthLayoutComponent,
    LandingComponent,
    DashboardComponent,
    LoginComponent,
    RegisterOwnerComponent,
    RegisterSupplierComponent,
    SetPasswordComponent,
    ProfileComponent,
    DepartmentsComponent,
    StaffListComponent,
    InviteStaffComponent,
    SupplierListComponent,
    SupplierCatalogComponent,
    SupplierProductsComponent,
    SupplierConnectionsComponent,
    SupplierProductFormComponent,
    SupplierStockMovementsComponent,
    SupplierCustomersComponent,
    SupplierSalesReportComponent,
    PurchaseListComponent,
    CreatePurchaseComponent,
    PurchaseDetailComponent,
    ProductListComponent,
    AddProductComponent,
    StockMovementsComponent,
    CustomerListComponent,
    CreateSaleComponent,
    SaleListComponent,
    InvoiceComponent,
    DashboardReportComponent,
    InventoryReportComponent,
    SalesReportComponent,
    SupplierApprovalComponent,
    ChangePasswordComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    SharedModule,
    BaseChartDirective,
    ToastrModule.forRoot({
      timeOut: 3000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      closeButton: true,
      progressBar: true,
    }),
  ],
  providers: [
    provideCharts(withDefaultRegisterables()),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
