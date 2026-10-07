









import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatModule } from './mat.module';

// Components
import { StatusBadgeComponent } from './components/status-badge/status-badge';
import { SearchBarComponent } from './components/search-bar/search-bar';
import { LoaderComponent } from './components/loader/loader';
import { PageHeaderComponent } from './components/page-header/page-header';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog';
import { ChatbotComponent } from './components/chatbot/chatbot';

// Directives
import { CurrencyFormatDirective } from './directives/currency-format.directive';
import { HighlightDirective } from './directives/highlight.directive';
import { NumberOnlyDirective } from './directives/number-only.directive';
import { PermissionDirective } from './directives/permission.directive';
import { PhoneMaskDirective } from './directives/phone-mask.directive';

// Pipes
import { DateFormatPipe } from './pipes/date-format.pipe';
import { EnumToArrayPipe } from './pipes/enum-to-array.pipe';
import { FilterPipe } from './pipes/filter.pipe';
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { SortPipe } from './pipes/sort.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { ReplaceNewlinePipe } from './pipes/replace-newline.pipe';

@NgModule({
  declarations: [
    StatusBadgeComponent,
    SearchBarComponent,
    LoaderComponent,
    PageHeaderComponent,
    ConfirmDialogComponent,
    ChatbotComponent,
    CurrencyFormatDirective,
    HighlightDirective,
    NumberOnlyDirective,
    PermissionDirective,
    PhoneMaskDirective,
    DateFormatPipe,
    EnumToArrayPipe,
    FilterPipe,
    SafeHtmlPipe,
    SortPipe,
    TruncatePipe,
    ReplaceNewlinePipe,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatModule
  ],
  exports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatModule,
    StatusBadgeComponent,
    SearchBarComponent,
    LoaderComponent,
    PageHeaderComponent,
    ConfirmDialogComponent,
    ChatbotComponent,
    CurrencyFormatDirective,
    HighlightDirective,
    NumberOnlyDirective,
    PermissionDirective,
    PhoneMaskDirective,
    DateFormatPipe,
    EnumToArrayPipe,
    FilterPipe,
    SafeHtmlPipe,
    SortPipe,
    TruncatePipe,
    ReplaceNewlinePipe,
  ]
})
export class SharedModule { }
