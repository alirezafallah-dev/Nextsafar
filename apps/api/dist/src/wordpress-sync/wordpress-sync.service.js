"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WordpressSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordpressSyncService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let WordpressSyncService = WordpressSyncService_1 = class WordpressSyncService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(WordpressSyncService_1.name);
    }
    async processWebhook(dto) {
        const { wp_post_id, event_type } = dto;
        this.logger.log(`🔄 Processing webhook for WP Post ${wp_post_id}, Event: ${event_type}`);
        try {
            if (event_type === 'CREATE' || event_type === 'UPDATE') {
                await this.handleCreateOrUpdate(dto);
            }
            else if (event_type === 'DELETE' || event_type === 'TRASH') {
                await this.handleDeleteOrTrash(wp_post_id);
            }
            await this.logSync(wp_post_id, event_type, 'SUCCESS', null);
            return { success: true, message: 'Webhook processed successfully' };
        }
        catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error(`❌ Failed to process webhook for ${wp_post_id}`, err.stack);
            await this.logSync(wp_post_id, event_type, 'FAILED', err.message);
            throw new common_1.BadRequestException('Failed to process webhook');
        }
    }
    async handleCreateOrUpdate(dto) {
        const { post_type } = dto;
        if (post_type === 'hotel') {
            await this.syncHotel(dto);
        }
        else if (post_type === 'visa') {
            await this.syncVisaType(dto);
        }
        else {
            this.logger.warn(`Unknown post type: ${post_type}`);
        }
    }
    async syncHotel(dto) {
        const { wp_post_id, slug, title, status } = dto;
        let publishStatus = client_1.HotelPublishStatus.DRAFT;
        if (status === 'publish')
            publishStatus = client_1.HotelPublishStatus.PUBLISHED;
        else if (status === 'trash')
            publishStatus = client_1.HotelPublishStatus.INACTIVE;
        const existingHotel = await this.prisma.hotel.findUnique({ where: { wpPostId: wp_post_id } });
        const galleryImages = [];
        if (dto.featured_image) {
            galleryImages.push({ url: dto.featured_image, isPrimary: true });
        }
        if (dto.gallery && Array.isArray(dto.gallery)) {
            galleryImages.push(...dto.gallery.map(url => ({ url, isPrimary: false })));
        }
        if (existingHotel) {
            if (slug && existingHotel.slug !== slug) {
                this.logger.log(`🔀 Slug changed from ${existingHotel.slug} to ${slug}. Saving old slug for redirect.`);
                await this.prisma.hotelSlug.create({
                    data: { slug: existingHotel.slug, hotelId: existingHotel.id },
                });
            }
            await this.prisma.hotel.update({
                where: { id: existingHotel.id },
                data: {
                    slug: slug || existingHotel.slug,
                    name: title || existingHotel.name,
                    publishStatus,
                    nameEn: dto.name_en || existingHotel.nameEn,
                    city: dto.city || existingHotel.city,
                    country: dto.country || existingHotel.country,
                    countryCode: dto.country_code || existingHotel.countryCode,
                    address: dto.address || existingHotel.address,
                    stars: dto.stars ?? existingHotel.stars,
                    rating: dto.rating ?? existingHotel.rating,
                    reviewsCount: dto.reviews_count ?? existingHotel.reviewsCount,
                    staffPoint: dto.staff_point ?? existingHotel.staffPoint,
                    facilitiesPoint: dto.facilities_point ?? existingHotel.facilitiesPoint,
                    cleanlinessPoint: dto.cleanliness_point ?? existingHotel.cleanlinessPoint,
                    comfortPoint: dto.comfort_point ?? existingHotel.comfortPoint,
                    servicesPoint: dto.services_point ?? existingHotel.servicesPoint,
                    locationPoint: dto.location_point ?? existingHotel.locationPoint,
                    featuredImage: dto.featured_image || existingHotel.featuredImage,
                    galleryImages: galleryImages.length > 0 ? galleryImages : existingHotel.galleryImages,
                    amenities: dto.amenities || existingHotel.amenities,
                    amenitiesCount: dto.amenities?.length ?? existingHotel.amenitiesCount,
                    coordinates: dto.coordinates ? dto.coordinates : existingHotel.coordinates,
                    nearbyPlaces: dto.nearby_places || existingHotel.nearbyPlaces,
                    price: dto.price ?? existingHotel.price,
                    priceFormatted: dto.price_formatted || existingHotel.priceFormatted,
                    currency: dto.currency || existingHotel.currency,
                    bookingLink: dto.booking_link || existingHotel.bookingLink,
                    checkinTime: dto.checkin_time || existingHotel.checkinTime,
                    checkoutTime: dto.checkout_time || existingHotel.checkoutTime,
                    checkinPolicy: dto.checkin_policy || existingHotel.checkinPolicy,
                    checkoutPolicy: dto.checkout_policy || existingHotel.checkoutPolicy,
                    expensesPolicy: dto.expenses_policy || existingHotel.expensesPolicy,
                    ageRestriction: dto.age_restriction || existingHotel.ageRestriction,
                    petsPolicy: dto.pets_policy || existingHotel.petsPolicy,
                    shortDescription: dto.excerpt || existingHotel.shortDescription,
                    fullContent: dto.content || existingHotel.fullContent,
                    instructions: dto.instructions || existingHotel.instructions,
                    seoTitle: dto.seo_title || existingHotel.seoTitle,
                    seoDescription: dto.seo_description || existingHotel.seoDescription,
                    seoImage: dto.seo_image || existingHotel.seoImage,
                    focusKeyword: dto.focus_keyword || existingHotel.focusKeyword,
                    ogImage: dto.og_image || existingHotel.ogImage,
                    canonical: dto.canonical || existingHotel.canonical,
                    acfFields: dto.acf_fields || existingHotel.acfFields,
                    hotelType: dto.hotel_type || existingHotel.hotelType,
                    propertyToken: dto.property_token || existingHotel.propertyToken,
                    externalId: dto.external_id || existingHotel.externalId,
                    faq: dto.faq || existingHotel.faq,
                    tags: dto.tags || existingHotel.tags,
                    categories: dto.categories || existingHotel.categories,
                    lastSyncedAt: new Date(),
                    contentVersion: { increment: 1 },
                },
            });
        }
        else {
            if (!slug || !title)
                throw new Error('Slug and Title are required for CREATE event');
            await this.prisma.hotel.create({
                data: {
                    wpPostId: wp_post_id,
                    slug,
                    name: title,
                    publishStatus,
                    nameEn: dto.name_en,
                    city: dto.city,
                    country: dto.country,
                    countryCode: dto.country_code,
                    address: dto.address,
                    stars: dto.stars,
                    rating: dto.rating,
                    reviewsCount: dto.reviews_count,
                    staffPoint: dto.staff_point,
                    facilitiesPoint: dto.facilities_point,
                    cleanlinessPoint: dto.cleanliness_point,
                    comfortPoint: dto.comfort_point,
                    servicesPoint: dto.services_point,
                    locationPoint: dto.location_point,
                    featuredImage: dto.featured_image,
                    galleryImages: galleryImages.length > 0 ? galleryImages : [],
                    amenities: dto.amenities || [],
                    amenitiesCount: dto.amenities?.length || 0,
                    coordinates: dto.coordinates,
                    nearbyPlaces: dto.nearby_places || [],
                    price: dto.price,
                    priceFormatted: dto.price_formatted,
                    currency: dto.currency,
                    bookingLink: dto.booking_link,
                    checkinTime: dto.checkin_time,
                    checkoutTime: dto.checkout_time,
                    checkinPolicy: dto.checkin_policy,
                    checkoutPolicy: dto.checkout_policy,
                    expensesPolicy: dto.expenses_policy,
                    ageRestriction: dto.age_restriction,
                    petsPolicy: dto.pets_policy,
                    shortDescription: dto.excerpt,
                    fullContent: dto.content,
                    instructions: dto.instructions,
                    seoTitle: dto.seo_title,
                    seoDescription: dto.seo_description,
                    seoImage: dto.seo_image,
                    focusKeyword: dto.focus_keyword,
                    ogImage: dto.og_image,
                    canonical: dto.canonical,
                    acfFields: dto.acf_fields,
                    hotelType: dto.hotel_type,
                    propertyToken: dto.property_token,
                    externalId: dto.external_id,
                    faq: dto.faq,
                    tags: dto.tags || [],
                    categories: dto.categories || [],
                    lastSyncedAt: new Date(),
                },
            });
        }
    }
    async syncVisaType(dto) {
        const { wp_post_id, slug, title, status } = dto;
        const isActive = status === 'publish';
        const existingVisaType = await this.prisma.visaType.findUnique({ where: { wpPostId: wp_post_id } });
        const commonData = {
            slug: slug || existingVisaType?.slug,
            title: title || existingVisaType?.title,
            shortDescription: dto.excerpt || existingVisaType?.shortDescription,
            fullContent: dto.content || existingVisaType?.fullContent,
            basePrice: dto.base_price ?? existingVisaType?.basePrice,
            currency: dto.currency || existingVisaType?.currency || 'USD',
            prices: dto.prices || existingVisaType?.prices,
            processingDays: dto.processing_days ?? existingVisaType?.processingDays,
            validityDays: dto.validity_days ?? existingVisaType?.validityDays,
            issueTime: dto.issue_time || existingVisaType?.issueTime,
            expiryTime: dto.expiry_time || existingVisaType?.expiryTime,
            entryType: dto.entry_type || existingVisaType?.entryType,
            visaType: dto.visa_type || existingVisaType?.visaType,
            requiredDocuments: dto.required_documents || existingVisaType?.requiredDocuments,
            bannerImage: dto.banner_image || existingVisaType?.bannerImage,
            featuredImage: dto.featured_image || existingVisaType?.featuredImage,
            gallery: dto.gallery || existingVisaType?.gallery,
            seoTitle: dto.seo_title || existingVisaType?.seoTitle,
            seoDescription: dto.seo_description || existingVisaType?.seoDescription,
            focusKeyword: dto.focus_keyword || existingVisaType?.focusKeyword,
            isActive,
            syncStatus: 'SYNCED',
            lastSyncedAt: new Date(),
        };
        if (existingVisaType) {
            await this.prisma.visaType.update({
                where: { id: existingVisaType.id },
                data: {
                    ...commonData,
                    contentVersion: { increment: 1 },
                },
            });
        }
        else {
            if (!slug || !title)
                throw new Error('Slug and Title are required for CREATE event');
            await this.prisma.visaType.create({
                data: {
                    wpPostId: wp_post_id,
                    ...commonData,
                    slug,
                    title,
                    contentVersion: 1,
                },
            });
        }
    }
    async handleDeleteOrTrash(wpPostId) {
        const hotel = await this.prisma.hotel.findUnique({ where: { wpPostId } });
        if (hotel) {
            await this.prisma.hotel.update({
                where: { id: hotel.id },
                data: { publishStatus: client_1.HotelPublishStatus.REMOVED_FROM_WORDPRESS, displayStatus: false },
            });
            return;
        }
        const visaType = await this.prisma.visaType.findUnique({ where: { wpPostId } });
        if (visaType) {
            await this.prisma.visaType.update({
                where: { id: visaType.id },
                data: { isActive: false, syncStatus: 'REMOVED' },
            });
        }
    }
    async logSync(wpPostId, eventType, status, errorMessage) {
        await this.prisma.syncLog.create({
            data: { wpPostId, eventType, status, errorMessage, processedAt: new Date() },
        });
    }
};
exports.WordpressSyncService = WordpressSyncService;
exports.WordpressSyncService = WordpressSyncService = WordpressSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WordpressSyncService);
//# sourceMappingURL=wordpress-sync.service.js.map