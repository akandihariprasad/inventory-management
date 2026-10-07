import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewChecked, HostListener, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ChatbotService, ChatMessage } from '../../../core/services/chatbot.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-chatbot',
    templateUrl: './chatbot.html',
    styleUrls: ['./chatbot.css'],
    animations: [
        trigger('slideInOut', [
            transition(':enter', [
                style({ transform: 'translateY(100%)', opacity: 0 }),
                animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
            ]),
            transition(':leave', [
                animate('200ms ease-in', style({ transform: 'translateY(100%)', opacity: 0 }))
            ])
        ]),
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0 }),
                animate('200ms', style({ opacity: 1 }))
            ])
        ])
    ],
    standalone: false
})
export class ChatbotComponent implements OnInit, OnDestroy, AfterViewChecked {
    @ViewChild('chatMessages') private chatMessagesContainer!: ElementRef;
    @ViewChild('chatInput') private chatInput!: ElementRef;

    isOpen = false;
    isMinimized = false;
    messages: ChatMessage[] = [];
    messageForm!: FormGroup;
    isLoading = false;
    suggestions: string[] = [];
    isAuthenticated = false;
    unreadCount = 0;
    currentUser: any = null;
    typingTimeout: any;
    isMobile = false;

    private readonly QUICK_ACTIONS = {
        SUPPLIER: [
            { icon: 'inventory_2', label: 'Add Product', action: 'add_product', color: '#4f46e5' },
            { icon: 'list', label: 'My Products', action: 'view_products', color: '#10b981' },
            { icon: 'warning', label: 'Low Stock', action: 'low_stock', color: '#f59e0b' },
            { icon: 'history', label: 'Stock Movements', action: 'stock_movements', color: '#8b5cf6' },
            { icon: 'shopping_cart', label: 'Purchase Requests', action: 'view_purchases', color: '#ec4899' },
            { icon: 'bar_chart', label: 'Reports', action: 'view_reports', color: '#06b6d4' }
        ],
        OWNER: [
            { icon: 'point_of_sale', label: 'New Sale', action: 'create_sale', color: '#4f46e5' },
            { icon: 'list', label: 'Sales Orders', action: 'view_sales', color: '#10b981' },
            { icon: 'add_shopping_cart', label: 'Create Purchase', action: 'create_purchase', color: '#f59e0b' },
            { icon: 'inventory', label: 'Products', action: 'view_products', color: '#8b5cf6' },
            { icon: 'checklist', label: 'Check Stock', action: 'check_stock', color: '#ec4899' },
            { icon: 'bar_chart', label: 'Reports', action: 'view_reports', color: '#06b6d4' },
            { icon: 'person_add', label: 'Add Customer', action: 'add_customer', color: '#14b8a6' },
            { icon: 'local_shipping', label: 'Suppliers', action: 'view_suppliers', color: '#f97316' }
        ],
        GUEST: [
            { icon: 'login', label: 'Login', action: 'login', color: '#4f46e5' },
            { icon: 'business', label: 'Register Owner', action: 'register_owner', color: '#10b981' },
            { icon: 'local_shipping', label: 'Register Supplier', action: 'register_supplier', color: '#f59e0b' },
            { icon: 'help', label: 'Help', action: 'help', color: '#8b5cf6' }
        ]
    };

    quickActions: any[] = [];

    constructor(
        private chatbotService: ChatbotService,
        private authService: AuthService,
        private router: Router,
        private fb: FormBuilder,
        private toastr: ToastrService,
        private cdr: ChangeDetectorRef
    ) {
        this.checkMobile();
    }

    ngOnInit(): void {
        this.messageForm = this.fb.group({
            message: ['']
        });

        this.authService.currentUser$.subscribe(user => {
            this.currentUser = user;
            this.isAuthenticated = !!user;
            if (this.isAuthenticated) {
                this.loadSuggestions();
                this.updateQuickActions();
                this.addWelcomeMessage();
                this.loadChatHistory();
            } else {
                this.updateQuickActions();
                this.addWelcomeMessage();
            }
            this.cdr.detectChanges();
        });

        this.isOpen = localStorage.getItem('chatOpen') === 'true' || false;
        if (this.isOpen) {
            setTimeout(() => this.focusInput(), 300);
        }
    }

    ngAfterViewChecked(): void {
        this.scrollToBottom();
    }

    ngOnDestroy(): void {
        localStorage.setItem('chatOpen', this.isOpen.toString());
        if (this.typingTimeout) {
            clearTimeout(this.typingTimeout);
        }
    }

    @HostListener('window:resize')
    checkMobile(): void {
        this.isMobile = window.innerWidth < 768;
        if (this.isMobile && this.isOpen) {
            this.isMinimized = true;
        }
    }

    toggleChat(): void {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.unreadCount = 0;
            setTimeout(() => this.focusInput(), 300);
            this.loadChatHistory();
        }
        localStorage.setItem('chatOpen', this.isOpen.toString());
        this.cdr.detectChanges();
    }

    toggleMinimize(): void {
        this.isMinimized = !this.isMinimized;
        this.cdr.detectChanges();
    }

    focusInput(): void {
        if (this.chatInput) {
            const inputElement = this.chatInput.nativeElement;
            if (inputElement) {
                inputElement.focus();
            }
        }
    }

    loadChatHistory(): void {
        const saved = localStorage.getItem('chatHistory');
        if (saved && this.isAuthenticated) {
            try {
                const history = JSON.parse(saved);
                if (Array.isArray(history) && history.length > 0) {
                    this.messages = history.slice(-20);
                    this.scrollToBottom();
                }
            } catch (e) {
                console.error('Error loading chat history');
            }
        }
        this.cdr.detectChanges();
    }

    saveChatHistory(): void {
        if (this.isAuthenticated && this.messages.length > 0) {
            localStorage.setItem('chatHistory', JSON.stringify(this.messages.slice(-50)));
        }
    }

    updateQuickActions(): void {
        if (this.isAuthenticated) {
            const role = this.currentUser?.role;
            if (role === 'SUPPLIER') {
                this.quickActions = this.QUICK_ACTIONS.SUPPLIER;
            } else if (role === 'OWNER' || role === 'ADMIN') {
                this.quickActions = this.QUICK_ACTIONS.OWNER;
            } else {
                this.quickActions = this.QUICK_ACTIONS.GUEST;
            }
        } else {
            this.quickActions = this.QUICK_ACTIONS.GUEST;
        }
        this.cdr.detectChanges();
    }

    addWelcomeMessage(): void {
        const userName = this.currentUser?.name || 'Guest';
        const roleSpecificMessage = this.getRoleSpecificMessage();

        const welcomeMessage: ChatMessage = {
            message: `👋 Hello ${userName}! ${roleSpecificMessage}\n\n💡 Type 'Help' or click on any suggestion below to get started.`,
            intent: 'WELCOME',
            actions: [],
            data: null,
            timestamp: new Date()
        };

        if (this.messages.length === 0) {
            this.messages.push(welcomeMessage);
            this.saveChatHistory();
        }
        this.cdr.detectChanges();
    }

    getRoleSpecificMessage(): string {
        if (!this.isAuthenticated) {
            return "Welcome to Inventory Management System! Please login or register to access all features.";
        }

        const role = this.currentUser?.role;
        if (role === 'SUPPLIER') {
            return "Welcome to your Supplier Portal! You can manage your products, track inventory, and view purchase requests.";
        } else if (role === 'OWNER' || role === 'ADMIN') {
            return "Welcome to your Business Dashboard! You can manage sales, purchases, inventory, and customers.";
        }
        return "Welcome to Inventory Management System!";
    }

    loadSuggestions(): void {
        this.chatbotService.getSuggestions().subscribe({
            next: (response) => {
                this.suggestions = response.data || [];
                this.cdr.detectChanges();
            },
            error: (error) => {
                console.error('Error loading suggestions:', error);
                this.suggestions = ['Help', 'View Products', 'Create Sale', 'View Reports'];
                this.cdr.detectChanges();
            }
        });
    }

    quickAction(action: string): void {
        const actionMap: { [key: string]: string } = {
            'add_product': 'I want to add a product',
            'view_products': 'Show my products',
            'low_stock': 'Show low stock products',
            'stock_movements': 'Show stock movements',
            'view_purchases': 'Show purchase requests',
            'view_reports': 'Show reports',
            'create_sale': 'I want to create a sale',
            'view_sales': 'Show sales orders',
            'create_purchase': 'I want to create a purchase request',
            'check_stock': 'Check stock levels',
            'add_customer': 'Add a new customer',
            'view_suppliers': 'Show suppliers',
            'login': 'Take me to login',
            'register_owner': 'Register as company owner',
            'register_supplier': 'Register as supplier',
            'help': 'Help'
        };

        const message = actionMap[action] || action;
        this.messageForm.get('message')?.setValue(message);
        this.sendMessage();
    }

    sendMessage(): void {
        const message = this.messageForm.get('message')?.value?.trim();
        if (!message) return;

        const userMessage: ChatMessage = {
            message: message,
            intent: '',
            actions: [],
            data: null,
            timestamp: new Date()
        };
        this.messages.push(userMessage);
        this.messageForm.reset();
        this.saveChatHistory();
        this.cdr.detectChanges();

        this.isLoading = true;
        this.scrollToBottom();

        this.typingTimeout = setTimeout(() => {
            this.chatbotService.sendMessage(message).subscribe({
                next: (response) => {
                    this.isLoading = false;
                    const botMessage: ChatMessage = {
                        message: response.data.message,
                        intent: response.data.intent,
                        actions: response.data.actions || [],
                        data: response.data.data,
                        timestamp: new Date(response.data.timestamp)
                    };
                    this.messages.push(botMessage);
                    this.saveChatHistory();

                    if (botMessage.actions && botMessage.actions.length > 0) {
                        this.executeActions(botMessage.actions);
                    }
                    this.scrollToBottom();
                    this.cdr.detectChanges();
                },
                error: (error) => {
                    this.isLoading = false;
                    const errorMsg = error.error?.message || 'Sorry, I encountered an error. Please try again.';
                    const errorMessage: ChatMessage = {
                        message: errorMsg,
                        intent: 'ERROR',
                        actions: [],
                        data: null,
                        timestamp: new Date()
                    };
                    this.messages.push(errorMessage);
                    this.saveChatHistory();
                    this.toastr.error(errorMsg);
                    this.scrollToBottom();
                    this.cdr.detectChanges();
                }
            });
        }, 300);
    }

    executeActions(actions: string[]): void {
        for (let i = 0; i < actions.length; i++) {
            const action = actions[i];
            if (action === 'navigate' && actions[i + 1]) {
                const path = actions[i + 1];
                setTimeout(() => {
                    this.router.navigate([path]);
                    this.toastr.info(`Navigating to ${path}`, 'Chatbot', { timeOut: 2000 });
                }, 500);
                i++;
            } else if (action === 'openAddProductForm') {
                setTimeout(() => {
                    this.router.navigate(['/supplier/products/add']);
                    this.toastr.info('Opening add product form', 'Chatbot', { timeOut: 2000 });
                }, 500);
            }
        }
    }

    sendSuggestion(suggestion: string): void {
        this.messageForm.get('message')?.setValue(suggestion);
        this.sendMessage();
    }

    clearChat(): void {
        if (confirm('Are you sure you want to clear chat history?')) {
            this.messages = [];
            this.addWelcomeMessage();
            this.saveChatHistory();
            this.toastr.success('Chat history cleared');
            this.cdr.detectChanges();
        }
    }

    private scrollToBottom(): void {
        setTimeout(() => {
            if (this.chatMessagesContainer) {
                this.chatMessagesContainer.nativeElement.scrollTop = this.chatMessagesContainer.nativeElement.scrollHeight;
            }
        }, 100);
    }

    formatTime(date: Date): string {
        const now = new Date();
        const msgDate = new Date(date);
        const diff = now.getTime() - msgDate.getTime();
        const hours = diff / (1000 * 60 * 60);

        if (hours < 24) {
            return msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else {
            return msgDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
        }
    }

    handleKeyPress(event: any): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }
}
