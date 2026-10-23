import { z } from 'zod';

export const wpWebhookSchema = z.object({
  wp_post_id: z.number().int().positive(),
  post_type: z.enum(['hotel', 'visa', 'destination', 'airport', 'restaurant', 'hospital', 'travelguide', 'travelnews']).default('hotel'),
  event_type: z.enum(['CREATE', 'UPDATE', 'DELETE', 'TRASH']),
  
  // Common fields
  slug: z.string().optional(),
  title: z.string().optional(),
  status: z.string().optional(),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  
  // Media
  featured_image: z.string().optional(),
  gallery: z.array(z.string()).optional(),
  banner_image: z.string().optional(),
  
  // Location
  city: z.string().optional(),
  country: z.string().optional(),
  country_code: z.string().optional(),
  address: z.string().optional(),
  coordinates: z.object({ lat: z.number(), lng: z.number() }).optional(),
  
  // Hotel-specific fields
  name_en: z.string().optional(),
  stars: z.number().optional(),
  rating: z.number().optional(),
  reviews_count: z.number().optional(),
  staff_point: z.number().optional(),
  facilities_point: z.number().optional(),
  cleanliness_point: z.number().optional(),
  comfort_point: z.number().optional(),
  services_point: z.number().optional(),
  location_point: z.number().optional(),
  amenities: z.array(z.any()).optional(),
  nearby_places: z.array(z.any()).optional(),
  price: z.number().optional(),
  price_formatted: z.string().optional(),
  currency: z.string().optional(),
  booking_link: z.string().optional(),
  checkin_time: z.string().optional(),
  checkout_time: z.string().optional(),
  checkin_policy: z.string().optional(),
  checkout_policy: z.string().optional(),
  expenses_policy: z.string().optional(),
  age_restriction: z.string().optional(),
  pets_policy: z.string().optional(),
  instructions: z.string().optional(),
  acf_fields: z.any().optional(),
  hotel_type: z.string().optional(),
  property_token: z.string().optional(),
  external_id: z.string().optional(),
  
  // SEO
  seo_title: z.string().optional(),
  seo_description: z.string().optional(),
  seo_image: z.string().optional(),
  focus_keyword: z.string().optional(),
  og_image: z.string().optional(),
  canonical: z.string().optional(),
  
  // Misc
  faq: z.any().optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  
  // Visa-specific fields
  base_price: z.number().optional(),
  prices: z.any().optional(),
  processing_days: z.number().optional(),
  validity_days: z.number().optional(),
  issue_time: z.string().optional(),
  expiry_time: z.string().optional(),
  entry_type: z.string().optional(),
  visa_type: z.string().optional(),
  required_documents: z.any().optional(),
});

export type WpWebhookDto = z.infer<typeof wpWebhookSchema>;
