
export interface DashboardSummary {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    pendingPurchaseOrders: number;
    todaySalesCount: number;
    todaySalesRevenue: number;
    todayItemsSold: number;
    currentMonthSalesCount: number;
    currentMonthRevenue: number;
    currentMonthItemsSold: number;
    totalCustomers: number;
    totalSuppliers: number;
    totalInventoryValue: number;
}

export interface InventorySummary {
    productId: number;
    productName: string;
    sku: string;
    category: string;
    currentStock: number;
    minimumStockLevel: number;
    isLowStock: boolean;
    unitPrice: number;
    totalValue: number;
    status: string;
}

export interface SalesSummary {
    date: string;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalDiscount: number;
    totalItemsSold: number;
}

export interface LowStockAlert {
    productId: number;
    productName: string;
    sku: string;
    category: string;
    currentStock: number;
    minimumStockLevel: number;
    reorderQuantity: number;
    urgencyLevel: string;
}

export interface TopProduct {
    productId: number;
    productName: string;
    sku: string;
    category: string;
    totalQuantitySold: number;
    totalRevenue: number;
    currentStock: number;
}