"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var backupDir, readBackup, businesses, agencies, reviews, tourPackages, trips, tripDays;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting migration to unified polymorphic Business model...');
                    backupDir = path.join(process.cwd(), 'prisma');
                    readBackup = function (filename) {
                        var filePath = path.join(backupDir, filename);
                        if (fs.existsSync(filePath)) {
                            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                        }
                        return [];
                    };
                    businesses = readBackup('backup_business.json');
                    agencies = readBackup('backup_agency.json');
                    reviews = readBackup('backup_review.json');
                    tourPackages = readBackup('backup_tourpackage.json');
                    trips = readBackup('backup_trip.json');
                    tripDays = readBackup('backup_tripday.json');
                    console.log("Found ".concat(businesses.length, " businesses, ").concat(agencies.length, " agencies."));
                    return [4 /*yield*/, prisma.$transaction(function (tx) { return __awaiter(_this, void 0, void 0, function () {
                            var _i, businesses_1, b, isClaimed, category, mappedData, _a, agencies_1, a, baseSlug, finalSlug, existing, mappedData, _b, reviews_1, r, exists, _c, tourPackages_1, tp, _d, trips_1, t, dStart, dEnd, dCreated, _e, tripDays_1, td;
                            return __generator(this, function (_f) {
                                switch (_f.label) {
                                    case 0:
                                        _i = 0, businesses_1 = businesses;
                                        _f.label = 1;
                                    case 1:
                                        if (!(_i < businesses_1.length)) return [3 /*break*/, 4];
                                        b = businesses_1[_i];
                                        isClaimed = b.isClaimed === 1 || b.isClaimed === true;
                                        category = b.category ? b.category.toUpperCase() : 'DINING';
                                        mappedData = {
                                            id: b.id,
                                            slug: b.slug,
                                            name: b.name,
                                            category: category,
                                            lat: b.lat,
                                            lng: b.lng,
                                            rating: b.rating,
                                            reviewsCount: b.reviewsCount || 0,
                                            imageUrl: b.imageUrl || '',
                                            heroImages: b.heroImages || '[]',
                                            whatsapp: b.whatsapp,
                                            isClaimed: isClaimed,
                                            locationSlug: b.locationSlug || '',
                                            tagline: b.tagline || '',
                                            description: b.description || '',
                                            contactEmail: b.contactEmail || '',
                                            socialLinks: b.socialLinks || '{}',
                                            instagramHandle: b.instagramHandle,
                                            instagramFollowers: b.instagramFollowers || 0,
                                            priceTier: b.priceTier || '$$',
                                            marginTier: b.marginTier || 'STANDARD',
                                            commissionRate: b.commissionRate || 0.05,
                                            viewsCount: b.viewsCount || 0,
                                            whatsappClicksCount: b.whatsappClicksCount || 0,
                                            aiRecommendationsCount: b.aiRecommendationsCount || 0,
                                            vehicleType: null,
                                            capacity: null,
                                            serviceZones: b.serviceZones || '[]',
                                            guideName: null,
                                            seoMetaTitle: null,
                                            seoMetaDesc: null,
                                            specialties: b.specialties || '[]',
                                            themeConfig: b.themeConfig || '{}',
                                            featuresJson: b.featuresJson || '[]',
                                        };
                                        return [4 /*yield*/, tx.business.upsert({
                                                where: { id: b.id },
                                                update: mappedData,
                                                create: mappedData
                                            })];
                                    case 2:
                                        _f.sent();
                                        _f.label = 3;
                                    case 3:
                                        _i++;
                                        return [3 /*break*/, 1];
                                    case 4:
                                        _a = 0, agencies_1 = agencies;
                                        _f.label = 5;
                                    case 5:
                                        if (!(_a < agencies_1.length)) return [3 /*break*/, 9];
                                        a = agencies_1[_a];
                                        baseSlug = a.slug || a.name.toLowerCase().replace(/\\s+/g, '-');
                                        finalSlug = baseSlug;
                                        return [4 /*yield*/, tx.business.findUnique({ where: { slug: baseSlug } })];
                                    case 6:
                                        existing = _f.sent();
                                        if (existing && existing.id !== a.id) {
                                            finalSlug = "".concat(baseSlug, "-").concat(a.id.substring(0, 6));
                                        }
                                        mappedData = {
                                            id: a.id,
                                            slug: finalSlug,
                                            name: a.name,
                                            category: 'ADVENTURE',
                                            description: a.description || '',
                                            tagline: a.tagline || '',
                                            locationSlug: a.location ? a.location.toLowerCase() : '',
                                            imageUrl: a.imageUrl || '',
                                            contactEmail: a.contactEmail || '',
                                            socialLinks: a.socialLinks || '{}',
                                            themeConfig: a.themeConfig || '{}',
                                            featuresJson: a.featuresJson || '[]',
                                            specialties: a.specialties || '[]',
                                            commissionRate: a.commissionRate || 0.05,
                                            guideName: a.guideName || '',
                                            seoMetaTitle: a.seoMetaTitle || '',
                                            seoMetaDesc: a.seoMetaDesc || '',
                                        };
                                        return [4 /*yield*/, tx.business.upsert({
                                                where: { id: a.id },
                                                update: mappedData,
                                                create: mappedData
                                            })];
                                    case 7:
                                        _f.sent();
                                        _f.label = 8;
                                    case 8:
                                        _a++;
                                        return [3 /*break*/, 5];
                                    case 9:
                                        _b = 0, reviews_1 = reviews;
                                        _f.label = 10;
                                    case 10:
                                        if (!(_b < reviews_1.length)) return [3 /*break*/, 14];
                                        r = reviews_1[_b];
                                        return [4 /*yield*/, tx.business.findUnique({ where: { id: r.businessId } })];
                                    case 11:
                                        exists = _f.sent();
                                        if (!exists) return [3 /*break*/, 13];
                                        return [4 /*yield*/, tx.review.upsert({
                                                where: { id: r.id },
                                                update: __assign({}, r),
                                                create: __assign({}, r)
                                            })];
                                    case 12:
                                        _f.sent();
                                        _f.label = 13;
                                    case 13:
                                        _b++;
                                        return [3 /*break*/, 10];
                                    case 14:
                                        _c = 0, tourPackages_1 = tourPackages;
                                        _f.label = 15;
                                    case 15:
                                        if (!(_c < tourPackages_1.length)) return [3 /*break*/, 18];
                                        tp = tourPackages_1[_c];
                                        return [4 /*yield*/, tx.tourPackage.upsert({
                                                where: { id: tp.id },
                                                update: {
                                                    title: tp.title,
                                                    tagline: tp.tagline || '',
                                                    sector: tp.sector || '',
                                                    pace: tp.pace || 'BALANCED',
                                                    description: tp.description || '',
                                                    basePriceUsd: tp.basePriceUsd || 0,
                                                    difficulty: tp.difficulty || 'MODERATE',
                                                    maxAltitude: tp.maxAltitude || '',
                                                    durationDays: tp.durationDays || 1,
                                                    durationStr: tp.durationStr || '',
                                                    elevation: tp.elevation || '',
                                                    bestSeason: tp.bestSeason || '',
                                                    packageType: tp.packageType || 'SINGLE_DAY',
                                                    tags: tp.tags || '',
                                                    included: tp.included || '[]',
                                                    notIncluded: tp.notIncluded || '[]',
                                                    highlights: tp.highlights || '[]',
                                                    requirements: tp.requirements || '[]',
                                                    itineraryJson: tp.itineraryJson || '[]',
                                                    galleryJson: tp.galleryJson || '[]',
                                                    heroImage: tp.heroImage || '',
                                                    businessId: tp.agencyId,
                                                },
                                                create: {
                                                    id: tp.id,
                                                    title: tp.title,
                                                    tagline: tp.tagline || '',
                                                    sector: tp.sector || '',
                                                    pace: tp.pace || 'BALANCED',
                                                    description: tp.description || '',
                                                    basePriceUsd: tp.basePriceUsd || 0,
                                                    difficulty: tp.difficulty || 'MODERATE',
                                                    maxAltitude: tp.maxAltitude || '',
                                                    durationDays: tp.durationDays || 1,
                                                    durationStr: tp.durationStr || '',
                                                    elevation: tp.elevation || '',
                                                    bestSeason: tp.bestSeason || '',
                                                    packageType: tp.packageType || 'SINGLE_DAY',
                                                    tags: tp.tags || '',
                                                    included: tp.included || '[]',
                                                    notIncluded: tp.notIncluded || '[]',
                                                    highlights: tp.highlights || '[]',
                                                    requirements: tp.requirements || '[]',
                                                    itineraryJson: tp.itineraryJson || '[]',
                                                    galleryJson: tp.galleryJson || '[]',
                                                    heroImage: tp.heroImage || '',
                                                    businessId: tp.agencyId,
                                                }
                                            })];
                                    case 16:
                                        _f.sent();
                                        _f.label = 17;
                                    case 17:
                                        _c++;
                                        return [3 /*break*/, 15];
                                    case 18:
                                        _d = 0, trips_1 = trips;
                                        _f.label = 19;
                                    case 19:
                                        if (!(_d < trips_1.length)) return [3 /*break*/, 22];
                                        t = trips_1[_d];
                                        dStart = t.startDate ? new Date(t.startDate) : new Date();
                                        dEnd = t.endDate ? new Date(t.endDate) : new Date();
                                        dCreated = t.createdAt ? new Date(t.createdAt) : new Date();
                                        return [4 /*yield*/, tx.trip.upsert({
                                                where: { id: t.id },
                                                update: {
                                                    tripTitle: t.tripTitle,
                                                    startDate: dStart,
                                                    endDate: dEnd,
                                                    paxCount: t.paxCount || 1,
                                                    baseCampStrategy: t.baseCampStrategy || '',
                                                    shareToken: t.shareToken,
                                                    status: t.status || 'DRAFT',
                                                    totalPriceUsd: t.totalPriceUsd || 0,
                                                    createdAt: dCreated,
                                                    isVerifiedTemplate: t.isVerifiedTemplate ? true : false,
                                                    templateVibeTags: t.templateVibeTags,
                                                    clonedFromId: t.clonedFromId,
                                                    userId: t.userId,
                                                    businessId: t.agencyId,
                                                },
                                                create: {
                                                    id: t.id,
                                                    tripTitle: t.tripTitle,
                                                    startDate: dStart,
                                                    endDate: dEnd,
                                                    paxCount: t.paxCount || 1,
                                                    baseCampStrategy: t.baseCampStrategy || '',
                                                    shareToken: t.shareToken,
                                                    status: t.status || 'DRAFT',
                                                    totalPriceUsd: t.totalPriceUsd || 0,
                                                    createdAt: dCreated,
                                                    isVerifiedTemplate: t.isVerifiedTemplate ? true : false,
                                                    templateVibeTags: t.templateVibeTags,
                                                    clonedFromId: t.clonedFromId,
                                                    userId: t.userId,
                                                    businessId: t.agencyId,
                                                }
                                            })];
                                    case 20:
                                        _f.sent();
                                        _f.label = 21;
                                    case 21:
                                        _d++;
                                        return [3 /*break*/, 19];
                                    case 22:
                                        _e = 0, tripDays_1 = tripDays;
                                        _f.label = 23;
                                    case 23:
                                        if (!(_e < tripDays_1.length)) return [3 /*break*/, 26];
                                        td = tripDays_1[_e];
                                        return [4 /*yield*/, tx.tripDay.upsert({
                                                where: { id: td.id },
                                                update: {
                                                    dayNumber: td.dayNumber,
                                                    date: td.date ? new Date(td.date) : new Date(),
                                                    sleepTown: td.sleepTown || '',
                                                    tourPackageId: td.tourPackageId,
                                                    dayTheme: td.dayTheme || '',
                                                    guideNotes: td.guideNotes,
                                                    startTime: td.startTime || '08:00 AM',
                                                    meetingPoint: td.meetingPoint,
                                                    eventsJson: td.eventsJson || '[]',
                                                    isAgencyLocked: td.isAgencyLocked === 1 || td.isAgencyLocked === true,
                                                    isCustomized: td.isCustomized === 1 || td.isCustomized === true,
                                                    tripId: td.tripId,
                                                },
                                                create: {
                                                    id: td.id,
                                                    dayNumber: td.dayNumber,
                                                    date: td.date ? new Date(td.date) : new Date(),
                                                    sleepTown: td.sleepTown || '',
                                                    tourPackageId: td.tourPackageId,
                                                    dayTheme: td.dayTheme || '',
                                                    guideNotes: td.guideNotes,
                                                    startTime: td.startTime || '08:00 AM',
                                                    meetingPoint: td.meetingPoint,
                                                    eventsJson: td.eventsJson || '[]',
                                                    isAgencyLocked: td.isAgencyLocked === 1 || td.isAgencyLocked === true,
                                                    isCustomized: td.isCustomized === 1 || td.isCustomized === true,
                                                    tripId: td.tripId,
                                                }
                                            })];
                                    case 24:
                                        _f.sent();
                                        _f.label = 25;
                                    case 25:
                                        _e++;
                                        return [3 /*break*/, 23];
                                    case 26: return [2 /*return*/];
                                }
                            });
                        }); })];
                case 1:
                    _a.sent();
                    console.log('Migration complete!');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
