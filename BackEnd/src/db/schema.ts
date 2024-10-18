import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  index,
  uniqueIndex,
  json,
  timestamp,
  integer,
  unique,
} from "drizzle-orm/pg-core";

// Enums

export const tierEnum = pgEnum("tiers", ["1", "2", "3", "4"]);

export const pixelianRoleEnum = pgEnum("roles", ["ADMIN", "USER"]);

export const liveStreamTypeEnum = pgEnum("live_type", ["LIVE", "END"]);

export const liveStreamInTypeEnum = pgEnum("live_insert_type", [
  "AUTO",
  "MANUAL",
]);

// Tables

export const vtuberTable = pgTable(
  "vtuber",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    description: varchar("description", { length: 1000 }),
    height: varchar("height", { length: 20 }).notNull(),
    birthdate: varchar("birthdate", { length: 20 }).notNull(),
    age: varchar("age", { length: 255 }).notNull(),
    icon_image: varchar("icon_image", { length: 255 })
      .default("UNDEFINED")
      .notNull(),
    port_image: varchar("port_image", { length: 255 })
      .default("UNDEFINED")
      .notNull(),
    youtube_channel_id: varchar("youtube_channel_id", { length: 255 })
      .default("UNDEFINED")
      .notNull(),
    youtube: varchar("youtube", { length: 255 }).unique().notNull(),
    twitter: varchar("twitter", { length: 255 }).unique().notNull(),
    discord: varchar("discord", { length: 255 }).unique().notNull(),
    facebook: varchar("facebook", { length: 255 }).unique().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => {
    return {
      vtuberIndex: index("nameIndex").on(t.name),
    };
  }
);

export const membershipTierTable = pgTable(
  "membership_tier",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    vtuber_name: varchar("vtuber_name", { length: 255 }).references(
      () => vtuberTable.name,
      {
        onUpdate: "cascade",
        onDelete: "cascade",
      }
    ),
    tier: tierEnum("tier").notNull(),
    tierName: varchar("tier_name", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => {
    return {
      tierIndex: uniqueIndex("vtuber_tierIndex").on(t.vtuber_name, t.tier),
    };
  }
);

export const pixelianTable = pgTable("pixelian", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  profile_picture: varchar("profile_picture", { length: 255 }),
  password: varchar("password", { length: 255 }).notNull(),
  favorite_vtuber: varchar("favorite_vtuber_name", { length: 255 }).references(
    () => vtuberTable.name,
    { onUpdate: "cascade", onDelete: "set null" }
  ),
  role: pixelianRoleEnum("role").default("USER").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const oauthPixelianTable = pgTable(
  "oauthPixelian",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    provider: varchar("provider", { length: 255 }).notNull(),
    provider_id: varchar("provider_id", { length: 255 }).unique().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    profile_picture: varchar("profile_picture", { length: 255 }),
    favorite_vtuber: varchar("favorite_vtuber_name", {
      length: 255,
    }).references(() => vtuberTable.name, {
      onUpdate: "cascade",
      onDelete: "set null",
    }),
    role: pixelianRoleEnum("role").default("USER").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => {
    return {
      providerEmailConstraint: unique("provider_emailUnique").on(
        t.provider,
        t.email
      ),
    };
  }
);

export const pixelianMemberShipTable = pgTable(
  "pixelian_membership",
  {
    pixelian_id: uuid("pixelian_id").references(() => pixelianTable.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
    membership_tier_id: uuid("membership_tier_id").references(
      () => membershipTierTable.id,
      { onUpdate: "cascade", onDelete: "cascade" }
    ),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => {
    return {
      pixelianMembershipConstraint: unique("pixelianMembershipConstraint").on(
        t.pixelian_id,
        t.membership_tier_id
      ),
    };
  }
);

export const oauthPixelianMembershipTable = pgTable(
  "oauthPixelian_membership",
  {
    oauth_pixelian_id: uuid("oauth_pixelian_id").references(
      () => oauthPixelianTable.id,
      {
        onUpdate: "cascade",
        onDelete: "cascade",
      }
    ),
    membership_tier_id: uuid("membership_tier_id").references(
      () => membershipTierTable.id,
      { onUpdate: "cascade", onDelete: "cascade" }
    ),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => {
    return {
      oauthPixelianMembershipConstraint: unique(
        "uniqueoauthPixelianMembershipConstraintConstraint"
      ).on(t.oauth_pixelian_id, t.membership_tier_id),
    };
  }
);

export const pixelianFeelingsTable = pgTable("pixelian_feelings", {
  id: uuid("id").defaultRandom().primaryKey(),
  feeling: varchar("feeling", { length: 1000 }).notNull(),
  vtuber_name: varchar("vtuber_name", { length: 255 })
    .notNull()
    .references(() => vtuberTable.name, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
  pixelian_id: uuid("pixelian_id").references(() => pixelianTable.id, {
    onUpdate: "cascade",
    onDelete: "cascade",
  }),
  oauth_pixelian_id: uuid("oauth_pixelian_id").references(
    () => oauthPixelianTable.id,
    {
      onUpdate: "cascade",
      onDelete: "cascade",
    }
  ),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const liveStreamCategoryTable = pgTable("liveStreamCategory", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const liveStreamTable = pgTable("liveStream", {
  id: uuid("id").defaultRandom().primaryKey(),
  vtuber_id: uuid("vtuber_id").references(() => vtuberTable.id, {
    onUpdate: "cascade",
    onDelete: "cascade",
  }),
  name: varchar("name", { length: 255 }).notNull(),
  stream_category_id: uuid("stream_category_id").references(
    () => liveStreamCategoryTable.id,
    {
      onUpdate: "cascade",
      onDelete: "set null",
    }
  ),
  link: varchar("link", { length: 255 }).notNull().unique(),
  thumbnail_link: varchar("thumbnail_link", { length: 255 })
    .notNull()
    .default("UNDEFINED"),
  status: liveStreamTypeEnum("status").notNull().default("END"),
  insert_type: liveStreamInTypeEnum("insert_type").notNull().default("MANUAL"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const incomingPixelianMemberProofTable = pgTable(
  "pixelian_membership_proof",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    pixelian_id: uuid("pixelian_id").references(() => pixelianTable.id, {
      onUpdate: "cascade",
      onDelete: "cascade",
    }),
    oauth_pixelian_id: uuid("oauth_pixelian_id").references(
      () => oauthPixelianTable.id,
      { onUpdate: "cascade", onDelete: "cascade" }
    ),
    membership_proof_image: varchar("membership_proof_image", {
      length: 255,
    }).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => {
    return {
      pixelianProofConstraint: unique("pixelian_proof_constraint").on(
        t.pixelian_id,
        t.membership_proof_image
      ),
      oauthPixelianProofConstraint: unique("oauthPixelian_proof_constraint").on(
        t.oauth_pixelian_id,
        t.membership_proof_image
      ),
    };
  }
);

// export const productTable = pgTable(
//   "product",
//   {
//     id: uuid("id").defaultRandom().primaryKey(),
//     name: varchar("name", { length: 255 }).notNull(),
//     description: varchar("description", { length: 255 }).notNull(),
//     img: varchar("img", { length: 255 }),
//     price: integer("price").notNull(),
//     quantity: integer("quantity")
//       .$defaultFn(() => 0)
//       .notNull(),
//     product_category_id: uuid("product_category_id").references(
//       () => productCategoryTable.id,
//       { onUpdate: "cascade", onDelete: "set null" }
//     ),
//     from_vtuber_name: varchar("from_vtuber_name", { length: 255 }).references(
//       () => vtuberTable.name,
//       { onUpdate: "cascade", onDelete: "cascade" }
//     ),
//     createdAt: timestamp("createdAt").defaultNow().notNull(),
//     updatedAt: timestamp("updatedAt")
//       .defaultNow()
//       .$onUpdate(() => new Date())
//       .notNull(),
//   },
//   (t) => {
//     return {
//       productIndex: index("productIndex").on(t.id),
//     };
//   }
// );

// export const salesDetailTable = pgTable("sales_detail", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   pixelian_id: uuid("pixelian_id").references(() => pixelianTable.id, {
//     onUpdate: "cascade",
//   }),
//   oauth_pixelian_id: uuid("oauth_pixelian_id").references(
//     () => oauthPixelianTable.id,
//     { onUpdate: "cascade" }
//   ),
//   product_id: uuid("product_id").references(() => productTable.id, {
//     onUpdate: "cascade",
//   }),
//   amount: integer("amount").notNull(),
//   total_price: integer("total_price").notNull(),
//   sale_date: timestamp("sale_date").defaultNow().notNull(),
//   createdAt: timestamp("createdAt").defaultNow().notNull(),
//   updatedAt: timestamp("updatedAt")
//     .defaultNow()
//     .$onUpdate(() => new Date())
//     .notNull(),
// });

// export const productCategoryTable = pgTable("product_category", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   name: varchar("name", { length: 255 }).unique().notNull(),
//   createdAt: timestamp("createdAt").defaultNow().notNull(),
//   updatedAt: timestamp("updatedAt")
//     .defaultNow()
//     .$onUpdate(() => new Date())
//     .notNull(),
// });

// Auxiliary Tables

export const pixelianSessionsTable = pgTable("pixelianSessions", {
  sid: varchar("sid", { length: 255 }).primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

// Relations

export const vtuberRelations = relations(vtuberTable, ({ one, many }) => {
  return {
    pixelianFavorite: many(pixelianTable),
    oauthPixelianFavorite: many(oauthPixelianTable),
    membershipTier: many(membershipTierTable),
    liveStream: many(liveStreamTable),
    feelingsFromPixelians: many(pixelianFeelingsTable),
    // product: many(productTable),
  };
});

export const pixelianRelations = relations(pixelianTable, ({ one, many }) => {
  return {
    favoriteVtuber: one(vtuberTable, {
      fields: [pixelianTable.favorite_vtuber],
      references: [vtuberTable.name],
    }),
    membershipTier: many(pixelianMemberShipTable),
    membershipProof: many(incomingPixelianMemberProofTable),
    feelingsToVtubers: many(pixelianFeelingsTable),
    // productOrdersDetails: many(salesDetailTable),
  };
});

export const oauthPixelianRelations = relations(
  oauthPixelianTable,
  ({ one, many }) => {
    return {
      favoriteVtuber: one(vtuberTable, {
        fields: [oauthPixelianTable.favorite_vtuber],
        references: [vtuberTable.name],
      }),
      membershipTier: many(oauthPixelianMembershipTable),
      membershipProof: many(incomingPixelianMemberProofTable),
      feelingsToVtubers: many(pixelianFeelingsTable),
      // orderedSalesDetails: many(salesDetailTable),
    };
  }
);

export const pixelianMemberShipRelations = relations(
  pixelianMemberShipTable,
  ({ one, many }) => {
    return {
      pixelian: one(pixelianTable, {
        fields: [pixelianMemberShipTable.pixelian_id],
        references: [pixelianTable.id],
      }),
    };
  }
);

export const oauthPixelianMemberShipRelations = relations(
  oauthPixelianMembershipTable,
  ({ one, many }) => {
    return {
      pixelian: one(pixelianTable, {
        fields: [oauthPixelianMembershipTable.oauth_pixelian_id],
        references: [pixelianTable.id],
      }),
    };
  }
);

export const pixelianFeelingsRelations = relations(
  pixelianFeelingsTable,
  ({ one, many }) => {
    return {
      toVtuber: one(vtuberTable, {
        fields: [pixelianFeelingsTable.vtuber_name],
        references: [vtuberTable.name],
      }),
      fromPixelian: one(pixelianTable, {
        fields: [pixelianFeelingsTable.pixelian_id],
        references: [pixelianTable.id],
      }),
      fromOauthPixelian: one(oauthPixelianTable, {
        fields: [pixelianFeelingsTable.oauth_pixelian_id],
        references: [oauthPixelianTable.id],
      }),
    };
  }
);

export const membershipTierRelations = relations(
  membershipTierTable,
  ({ one, many }) => {
    return {
      belongsToVtuber: one(vtuberTable, {
        fields: [membershipTierTable.vtuber_name],
        references: [vtuberTable.name],
      }),
      pixelianTier: many(pixelianMemberShipTable),
      oauthPixelianTier: many(oauthPixelianMembershipTable),
    };
  }
);

export const liveStreamRelations = relations(
  liveStreamTable,
  ({ one, many }) => {
    return {
      streamedBy: one(vtuberTable, {
        fields: [liveStreamTable.vtuber_id],
        references: [vtuberTable.id],
      }),
      inCategory: one(liveStreamCategoryTable, {
        fields: [liveStreamTable.stream_category_id],
        references: [liveStreamCategoryTable.id],
      }),
    };
  }
);

export const liveStreamCategoryRelations = relations(
  liveStreamCategoryTable,
  ({ one, many }) => {
    return {
      inLiveStream: many(liveStreamTable),
    };
  }
);

export const incomingPixelianMemberProofRelations = relations(
  incomingPixelianMemberProofTable,
  ({ one, many }) => {
    return {
      fromPixelian: one(pixelianTable, {
        fields: [incomingPixelianMemberProofTable.pixelian_id],
        references: [pixelianTable.id],
      }),
      fromOauthPixelian: one(oauthPixelianTable, {
        fields: [incomingPixelianMemberProofTable.oauth_pixelian_id],
        references: [oauthPixelianTable.id],
      }),
    };
  }
);

// export const productRelations = relations(productTable, ({ one, many }) => {
//   return {
//     fromVtuber: one(vtuberTable, {
//       fields: [productTable.from_vtuber_name],
//       references: [vtuberTable.name],
//     }),
//     inCategory: one(productCategoryTable, {
//       fields: [productTable.product_category_id],
//       references: [productCategoryTable.id],
//     }),
//     inSalesDetails: many(salesDetailTable),
//   };
// });

// export const productCategoryRelations = relations(
//   productCategoryTable,
//   ({ one, many }) => {
//     return {
//       belongsToProduct: many(productTable),
//     };
//   }
// );

// export const salesDetailRelations = relations(
//   salesDetailTable,
//   ({ one, many }) => {
//     return {
//       hasProduct: one(productTable, {
//         fields: [salesDetailTable.product_id],
//         references: [productTable.id],
//       }),
//       orderedByPixelian: one(pixelianTable, {
//         fields: [salesDetailTable.pixelian_id],
//         references: [pixelianTable.id],
//       }),
//       orderedByOAuthPixelian: one(oauthPixelianTable, {
//         fields: [salesDetailTable.oauth_pixelian_id],
//         references: [oauthPixelianTable.id],
//       }),
//     };
//   }
// );
