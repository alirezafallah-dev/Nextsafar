import { z } from 'zod';
export declare const orderItemSchema: z.ZodObject<{
    itemType: z.ZodEnum<{
        TOUR: "TOUR";
        HOTEL: "HOTEL";
        VISA: "VISA";
        SERVICE: "SERVICE";
    }>;
    itemId: z.ZodString;
    itemName: z.ZodString;
    quantity: z.ZodNumber;
    unitPrice: z.ZodNumber;
}, z.core.$strip>;
export declare const passengerSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    nationalId: z.ZodOptional<z.ZodString>;
    passportNumber: z.ZodOptional<z.ZodString>;
    birthDate: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<{
        MALE: "MALE";
        FEMALE: "FEMALE";
        OTHER: "OTHER";
    }>>;
    relationship: z.ZodDefault<z.ZodEnum<{
        OTHER: "OTHER";
        SELF: "SELF";
        SPOUSE: "SPOUSE";
        CHILD: "CHILD";
        PARENT: "PARENT";
    }>>;
}, z.core.$strip>;
export declare const createOrderSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        itemType: z.ZodEnum<{
            TOUR: "TOUR";
            HOTEL: "HOTEL";
            VISA: "VISA";
            SERVICE: "SERVICE";
        }>;
        itemId: z.ZodString;
        itemName: z.ZodString;
        quantity: z.ZodNumber;
        unitPrice: z.ZodNumber;
    }, z.core.$strip>>;
    passengers: z.ZodArray<z.ZodObject<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        nationalId: z.ZodOptional<z.ZodString>;
        passportNumber: z.ZodOptional<z.ZodString>;
        birthDate: z.ZodOptional<z.ZodString>;
        gender: z.ZodOptional<z.ZodEnum<{
            MALE: "MALE";
            FEMALE: "FEMALE";
            OTHER: "OTHER";
        }>>;
        relationship: z.ZodDefault<z.ZodEnum<{
            OTHER: "OTHER";
            SELF: "SELF";
            SPOUSE: "SPOUSE";
            CHILD: "CHILD";
            PARENT: "PARENT";
        }>>;
    }, z.core.$strip>>;
    discountCode: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
    idempotencyKey: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type CreateOrderDto = z.infer<typeof createOrderSchema>;
