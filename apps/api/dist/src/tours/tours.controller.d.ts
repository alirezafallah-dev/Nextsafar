import { ToursService } from './tours.service';
import { TourQueryDto } from './dto/tour-query.dto';
import { TourLeadDto } from './dto/tour-lead.dto';
export declare class ToursController {
    private readonly toursService;
    constructor(toursService: ToursService);
    findAll(query: TourQueryDto): Promise<{
        success: boolean;
        data: ({
            destination: {
                id: string;
                name: string;
                slug: string;
            };
            category: {
                id: string;
                name: string;
                slug: string;
            };
            dates: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                startDate: Date;
                tourId: string;
                endDate: Date;
                totalCapacity: number;
                remainingCapacity: number;
                adultPrice: number;
                childPrice: number;
                infantPrice: number;
                singlePrice: number | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            slug: string;
            images: import("@prisma/client/runtime/library").JsonValue | null;
            status: import("@prisma/client").$Enums.TourStatus;
            categoryId: string | null;
            destinationId: string | null;
            durationDays: number | null;
            durationNights: number | null;
            transportType: string | null;
        })[];
        meta: {
            page: number;
            per_page: number;
            total: number;
            total_pages: number;
        };
    }>;
    findOne(slug: string): Promise<{
        success: boolean;
        data: {
            destination: {
                id: string;
                name: string;
                slug: string;
            };
            category: {
                id: string;
                name: string;
                slug: string;
            };
            dates: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: string;
                startDate: Date;
                tourId: string;
                endDate: Date;
                totalCapacity: number;
                remainingCapacity: number;
                adultPrice: number;
                childPrice: number;
                infantPrice: number;
                singlePrice: number | null;
            }[];
            itineraries: {
                order: number;
                id: string;
                title: string;
                description: string;
                tourId: string;
                dayNumber: number;
            }[];
            services: {
                id: string;
                name: string;
                description: string | null;
                tourId: string;
                isIncluded: boolean;
            }[];
            hotelRelations: ({
                hotel: {
                    id: string;
                    currency: string | null;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    city: string | null;
                    wpPostId: number | null;
                    slug: string;
                    nameEn: string | null;
                    country: string | null;
                    countryCode: string | null;
                    address: string | null;
                    publishStatus: import("@prisma/client").$Enums.HotelPublishStatus;
                    displayStatus: boolean;
                    syncStatus: string | null;
                    source: string | null;
                    shortDescription: string | null;
                    fullContent: string | null;
                    instructions: string | null;
                    stars: number | null;
                    rating: number | null;
                    reviewsCount: number | null;
                    staffPoint: number | null;
                    facilitiesPoint: number | null;
                    cleanlinessPoint: number | null;
                    comfortPoint: number | null;
                    servicesPoint: number | null;
                    locationPoint: number | null;
                    reviewsHistogram: import("@prisma/client/runtime/library").JsonValue | null;
                    reviewsBreakdown: import("@prisma/client/runtime/library").JsonValue | null;
                    featuredImage: string | null;
                    galleryImages: import("@prisma/client/runtime/library").JsonValue | null;
                    amenities: import("@prisma/client/runtime/library").JsonValue | null;
                    amenitiesCount: number | null;
                    coordinates: import("@prisma/client/runtime/library").JsonValue | null;
                    nearbyPlaces: import("@prisma/client/runtime/library").JsonValue | null;
                    price: number | null;
                    priceFormatted: string | null;
                    bookingLink: string | null;
                    checkinTime: string | null;
                    checkoutTime: string | null;
                    checkinPolicy: string | null;
                    checkoutPolicy: string | null;
                    expensesPolicy: string | null;
                    ageRestriction: string | null;
                    petsPolicy: string | null;
                    seoTitle: string | null;
                    seoDescription: string | null;
                    seoImage: string | null;
                    focusKeyword: string | null;
                    ogImage: string | null;
                    canonical: string | null;
                    acfFields: import("@prisma/client/runtime/library").JsonValue | null;
                    hotelType: string | null;
                    propertyToken: string | null;
                    externalId: string | null;
                    faq: import("@prisma/client/runtime/library").JsonValue | null;
                    tags: string[];
                    categories: string[];
                    mediaSyncStatus: string | null;
                    lastMediaSyncAt: Date | null;
                    contentVersion: number;
                    lastSyncedAt: Date | null;
                    wpLastModified: Date | null;
                };
            } & {
                id: string;
                hotelId: string;
                tourId: string;
                notes: string | null;
                relationType: string;
                priority: number;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            title: string;
            description: string | null;
            slug: string;
            images: import("@prisma/client/runtime/library").JsonValue | null;
            status: import("@prisma/client").$Enums.TourStatus;
            categoryId: string | null;
            destinationId: string | null;
            durationDays: number | null;
            durationNights: number | null;
            transportType: string | null;
        };
    }>;
    createLead(id: string, dto: TourLeadDto, req: any): Promise<{
        success: boolean;
        data: {
            message: string;
            leadId: string;
        };
    }>;
}
