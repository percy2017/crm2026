export type WooProduct = {
    id: number;
    name: string;
    slug: string;
    permalink: string;
    type: string;
    status: string;
    description: string;
    short_description: string;
    sku: string;
    price: string;
    regular_price: string;
    sale_price: string;
    on_sale: boolean;
    stock_status: string;
    stock_quantity: number | null;
    manage_stock: boolean;
    categories: { id: number; name: string; slug: string }[];
    brands: { id: number; name: string; slug: string }[];
    tags: { id: number; name: string; slug: string }[];
    images: { id: number; src: string; name: string; alt: string }[];
    attributes: {
        id: number;
        name: string;
        position: number;
        visible: boolean;
        variation: boolean;
        options: string[];
    }[];
    variations: number[];
    average_rating: string;
    rating_count: number;
    total_sales: number;
    date_created: string;
    date_modified: string;
};

export type WooOrder = {
    id: number;
    number: string;
    status: string;
    currency: string;
    date_created: string;
    date_modified: string;
    total: string;
    subtotal: string;
    total_tax: string;
    shipping_total: string;
    discount_total: string;
    payment_method: string;
    payment_method_title: string;
    customer_id: number;
    billing: WooAddress;
    shipping: WooAddress;
    line_items: WooLineItem[];
    shipping_lines: WooShippingLine[];
    tax_lines: { id: number; label: string; rate_code: string; tax_total: string }[];
    coupon_lines: { id: number; code: string; discount: string }[];
    note: string;
    customer_note: string;
    subscription_meta?: {
        title: string | null;
        start_date: string | null;
        end_date: string | null;
    };
    contact_profile_pic_url?: string | null;
    is_pos?: boolean;
    contact_id?: number | null;
    contact_name?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    sale_date?: string | null;
    tvp_terminal?: string | null;
    tvp_vendedor?: string | null;
};

export type WooAddress = {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email: string;
    phone: string;
};

export type WooLineItem = {
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    price: number;
    subtotal: string;
    total: string;
    sku: string;
};

export type WooShippingLine = {
    id: number;
    method_title: string;
    method_id: string;
    total: string;
};

export type WooCustomer = {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    role: string;
    billing: WooAddress;
    shipping: WooAddress;
    orders_count: number;
    total_spent: string;
    avatar_url: string;
    date_created: string;
    date_modified: string;
};

export type WooDashboard = {
    total_sales: string;
    total_orders: number;
    total_products: number;
    total_customers: number;
    net_sales: string;
    avg_order_value: string;
    top_sellers: { id: number; name: string; quantity: number; total: string }[];
    recent_orders: WooOrder[];
};

export type WooPaginatedResponse<T> = {
    data: T[];
    meta: {
        total_results: number;
        total_pages: number;
        current_page: number;
        previous_page: number | null;
        next_page: number | null;
        first_page: number;
        last_page: number;
    };
};
