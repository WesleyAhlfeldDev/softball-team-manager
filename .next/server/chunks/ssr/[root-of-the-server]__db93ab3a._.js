module.exports = [
"[externals]/@prisma/client [external] (@prisma/client, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("@prisma/client", () => require("@prisma/client"));

module.exports = mod;
}),
"[project]/src/lib/db.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "prisma",
    ()=>prisma
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/@prisma/client [external] (@prisma/client, cjs)");
;
const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new __TURBOPACK__imported__module__$5b$externals$5d2f40$prisma$2f$client__$5b$external$5d$__$2840$prisma$2f$client$2c$__cjs$29$__["PrismaClient"]({
    log: ("TURBOPACK compile-time truthy", 1) ? [
        "query",
        "error",
        "warn"
    ] : "TURBOPACK unreachable"
});
if ("TURBOPACK compile-time truthy", 1) globalForPrisma.prisma = prisma;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[project]/src/lib/auth.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "auth",
    ()=>auth,
    "handlers",
    ()=>handlers,
    "signIn",
    ()=>signIn,
    "signOut",
    ()=>signOut
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/index.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$providers$2f$credentials$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next-auth/providers/credentials.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-auth/node_modules/@auth/core/providers/credentials.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/bcryptjs/index.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v3/external.js [app-rsc] (ecmascript) <export * as z>");
;
;
;
;
;
const loginSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().email(),
    password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v3$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1)
});
const { handlers, signIn, signOut, auth } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["default"])({
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login"
    },
    callbacks: {
        jwt ({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;
                token.name = user.name;
            }
            return token;
        },
        session ({ session, token }) {
            if (token) {
                session.user.id = token.id;
                session.user.email = token.email;
                session.user.name = token.name;
            }
            return session;
        }
    },
    providers: [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$auth$2f$node_modules$2f40$auth$2f$core$2f$providers$2f$credentials$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },
            async authorize (credentials) {
                const parsed = loginSchema.safeParse(credentials);
                if (!parsed.success) return null;
                const { email, password } = parsed.data;
                const user = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].user.findUnique({
                    where: {
                        email
                    }
                });
                if (!user) return null;
                const passwordMatch = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$bcryptjs$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"].compare(password, user.passwordHash);
                if (!passwordMatch) return null;
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name
                };
            }
        })
    ]
});
}),
"[project]/src/server/actions/scorebook.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"4017173fd5205c81177cf591f2df8ea891b68215ac":"undoLastPlateAppearance","406a78936572a9aeec3ff858eca5c5ec5949815a6b":"startGame","4072730a3d602b6f6724f88c3e0d132cad39ffa242":"endGame","40a1839e23d6df77e108999b77873cb22df769589b":"recordPlateAppearance","40b8bfedb4ef8aeab2a7dee282473765846e67b168":"restartGame","60a6df8ac9f85689d30b8da2a58b904d9e62292b4b":"nextInning","70c17100a25bddfc0d7cd44deef733ec304425708b":"updateOpponentScore"},"",""] */ __turbopack_context__.s([
    "endGame",
    ()=>endGame,
    "nextInning",
    ()=>nextInning,
    "recordPlateAppearance",
    ()=>recordPlateAppearance,
    "restartGame",
    ()=>restartGame,
    "startGame",
    ()=>startGame,
    "undoLastPlateAppearance",
    ()=>undoLastPlateAppearance,
    "updateOpponentScore",
    ()=>updateOpponentScore
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
async function getTeamId() {
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    if (!session?.user?.id) throw new Error("Unauthorized");
    const team = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].team.findFirst({
        where: {
            userId: session.user.id
        },
        select: {
            id: true
        }
    });
    if (!team) throw new Error("No team found");
    return team.id;
}
async function startGame(gameId) {
    const teamId = await getTeamId();
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].game.update({
        where: {
            id: gameId,
            teamId
        },
        data: {
            status: "IN_PROGRESS",
            startedAt: new Date()
        }
    });
    // Create inning 1
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].inning.upsert({
        where: {
            gameId_inningNumber: {
                gameId,
                inningNumber: 1
            }
        },
        create: {
            gameId,
            inningNumber: 1
        },
        update: {}
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].playEvent.create({
        data: {
            gameId,
            type: "GAME_START",
            description: "Game started"
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/scorebook/${gameId}`);
    return {
        success: true
    };
}
async function recordPlateAppearance(data) {
    const teamId = await getTeamId();
    const game = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].game.findFirst({
        where: {
            id: data.gameId,
            teamId
        },
        include: {
            innings: {
                where: {
                    inningNumber: data.inningNumber
                }
            }
        }
    });
    if (!game) return {
        error: "Game not found"
    };
    // Ensure inning exists
    const inning = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].inning.upsert({
        where: {
            gameId_inningNumber: {
                gameId: data.gameId,
                inningNumber: data.inningNumber
            }
        },
        create: {
            gameId: data.gameId,
            inningNumber: data.inningNumber
        },
        update: {}
    });
    // Record plate appearance
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].plateAppearance.create({
        data: {
            gameId: data.gameId,
            playerId: data.playerId,
            inningNumber: data.inningNumber,
            battingOrderSlot: data.battingOrderSlot,
            atBatNumber: data.atBatNumber,
            result: data.result,
            rbis: data.rbis,
            runsScored: data.runsScored
        }
    });
    // Determine if it's an at-bat (not walk, sac fly, HBP)
    const isAtBat = ![
        "WALK",
        "HIT_BY_PITCH",
        "SAC_FLY",
        "SAC_BUNT"
    ].includes(data.result);
    const isHit = [
        "SINGLE",
        "DOUBLE",
        "TRIPLE",
        "HOME_RUN"
    ].includes(data.result);
    // Build human-readable description
    const resultLabels = {
        SINGLE: "1B",
        DOUBLE: "2B",
        TRIPLE: "3B",
        HOME_RUN: "HR",
        GROUNDOUT: "GO",
        FLYOUT: "FO",
        LINEOUT: "LO",
        POPOUT: "PO",
        STRIKEOUT: "K",
        WALK: "BB",
        HIT_BY_PITCH: "HBP",
        REACHED_ON_ERROR: "ROE",
        SAC_FLY: "SAC",
        SAC_BUNT: "SB",
        FIELDERS_CHOICE: "FC",
        DOUBLE_PLAY: "DP",
        TRIPLE_PLAY: "TP"
    };
    const player = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.findUnique({
        where: {
            id: data.playerId
        },
        select: {
            firstName: true,
            lastName: true
        }
    });
    const desc = [
        `${player?.firstName ?? ""} ${player?.lastName ?? ""} — ${resultLabels[data.result]}`,
        data.rbis > 0 ? `${data.rbis} RBI` : null,
        data.runsScored ? "Run scored" : null
    ].filter(Boolean).join(", ");
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].playEvent.create({
        data: {
            gameId: data.gameId,
            inningId: inning.id,
            type: "PLATE_APPEARANCE",
            inningNumber: data.inningNumber,
            description: desc
        }
    });
    // Update inning runs + hits
    if (data.rbis > 0 || data.runsScored) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].inning.update({
            where: {
                id: inning.id
            },
            data: {
                teamRuns: {
                    increment: data.rbis
                },
                teamHits: isHit ? {
                    increment: 1
                } : undefined
            }
        });
    } else if (isHit) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].inning.update({
            where: {
                id: inning.id
            },
            data: {
                teamHits: {
                    increment: 1
                }
            }
        });
    }
    // Update game totals
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].game.update({
        where: {
            id: data.gameId
        },
        data: {
            teamRuns: {
                increment: data.rbis
            },
            teamHits: isHit ? {
                increment: 1
            } : undefined
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/scorebook/${data.gameId}`);
    return {
        success: true
    };
}
async function undoLastPlateAppearance(gameId) {
    const teamId = await getTeamId();
    const game = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].game.findFirst({
        where: {
            id: gameId,
            teamId
        }
    });
    if (!game) return {
        error: "Game not found"
    };
    const last = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].plateAppearance.findFirst({
        where: {
            gameId
        },
        orderBy: {
            createdAt: "desc"
        }
    });
    if (!last) return {
        error: "Nothing to undo"
    };
    const isHit = [
        "SINGLE",
        "DOUBLE",
        "TRIPLE",
        "HOME_RUN"
    ].includes(last.result);
    // Reverse game totals
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].game.update({
        where: {
            id: gameId
        },
        data: {
            teamRuns: {
                decrement: last.rbis
            },
            teamHits: isHit ? {
                decrement: 1
            } : undefined
        }
    });
    // Reverse inning totals
    const inning = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].inning.findFirst({
        where: {
            gameId,
            inningNumber: last.inningNumber
        }
    });
    if (inning) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].inning.update({
            where: {
                id: inning.id
            },
            data: {
                teamRuns: {
                    decrement: last.rbis
                },
                teamHits: isHit ? {
                    decrement: 1
                } : undefined
            }
        });
    }
    // Delete last play event
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].playEvent.deleteMany({
        where: {
            gameId,
            type: "PLATE_APPEARANCE",
            inningNumber: last.inningNumber
        }
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].plateAppearance.delete({
        where: {
            id: last.id
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/scorebook/${gameId}`);
    return {
        success: true,
        undoneResult: last.result
    };
}
async function updateOpponentScore(gameId, inningNumber, runs) {
    const teamId = await getTeamId();
    const game = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].game.findFirst({
        where: {
            id: gameId,
            teamId
        }
    });
    if (!game) return {
        error: "Game not found"
    };
    const inning = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].inning.upsert({
        where: {
            gameId_inningNumber: {
                gameId,
                inningNumber
            }
        },
        create: {
            gameId,
            inningNumber,
            opponentRuns: Math.max(0, runs)
        },
        update: {
            opponentRuns: Math.max(0, runs)
        }
    });
    // Recalculate total opponent runs from all innings
    const innings = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].inning.findMany({
        where: {
            gameId
        }
    });
    const totalOpponentRuns = innings.reduce((sum, inn)=>sum + inn.opponentRuns, 0);
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].game.update({
        where: {
            id: gameId
        },
        data: {
            opponentRuns: totalOpponentRuns
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/scorebook/${gameId}`);
    return {
        success: true
    };
}
async function nextInning(gameId, currentInning) {
    const teamId = await getTeamId();
    const game = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].game.findFirst({
        where: {
            id: gameId,
            teamId
        }
    });
    if (!game) return {
        error: "Game not found"
    };
    // Mark current inning complete
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].inning.updateMany({
        where: {
            gameId,
            inningNumber: currentInning
        },
        data: {
            isComplete: true
        }
    });
    const nextInn = currentInning + 1;
    // Create next inning
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].inning.upsert({
        where: {
            gameId_inningNumber: {
                gameId,
                inningNumber: nextInn
            }
        },
        create: {
            gameId,
            inningNumber: nextInn
        },
        update: {}
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].playEvent.create({
        data: {
            gameId,
            type: "INNING_START",
            inningNumber: nextInn,
            description: `Inning ${nextInn} started`
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/scorebook/${gameId}`);
    return {
        success: true,
        nextInning: nextInn
    };
}
async function endGame(gameId) {
    const teamId = await getTeamId();
    const game = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].game.findFirst({
        where: {
            id: gameId,
            teamId
        },
        include: {
            plateAppearances: {
                include: {
                    player: true
                }
            },
            innings: true
        }
    });
    if (!game) return {
        error: "Game not found"
    };
    // ── Calculate per-player stats ──────────────────────────────
    const playerMap = new Map();
    for (const pa of game.plateAppearances){
        if (!playerMap.has(pa.playerId)) {
            playerMap.set(pa.playerId, {
                atBats: 0,
                plateAppearances: 0,
                hits: 0,
                singles: 0,
                doubles: 0,
                triples: 0,
                homeRuns: 0,
                rbi: 0,
                runs: 0,
                walks: 0,
                strikeouts: 0,
                sacFlies: 0,
                reachedOnError: 0
            });
        }
        const s = playerMap.get(pa.playerId);
        s.plateAppearances++;
        s.rbi += pa.rbis;
        if (pa.runsScored) s.runs++;
        const isAB = ![
            "WALK",
            "HIT_BY_PITCH",
            "SAC_FLY",
            "SAC_BUNT"
        ].includes(pa.result);
        if (isAB) s.atBats++;
        switch(pa.result){
            case "SINGLE":
                s.hits++;
                s.singles++;
                break;
            case "DOUBLE":
                s.hits++;
                s.doubles++;
                break;
            case "TRIPLE":
                s.hits++;
                s.triples++;
                break;
            case "HOME_RUN":
                s.hits++;
                s.homeRuns++;
                break;
            case "WALK":
                s.walks++;
                break;
            case "STRIKEOUT":
                s.strikeouts++;
                break;
            case "SAC_FLY":
                s.sacFlies++;
                break;
            case "REACHED_ON_ERROR":
                s.reachedOnError++;
                break;
        }
    }
    // Save per-game stats and update season totals
    for (const [playerId, stats] of playerMap.entries()){
        const ab = stats.atBats;
        const h = stats.hits;
        const bb = stats.walks;
        const sf = stats.sacFlies;
        const pa = stats.plateAppearances;
        const battingAvg = ab > 0 ? h / ab : null;
        const slugging = ab > 0 ? (stats.singles + 2 * stats.doubles + 3 * stats.triples + 4 * stats.homeRuns) / ab : null;
        const obp = ab + bb + sf > 0 ? (h + bb) / (ab + bb + sf) : null;
        const ops = obp !== null && slugging !== null ? obp + slugging : null;
        // Upsert game stats
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].playerGameStats.upsert({
            where: {
                gameId_playerId: {
                    gameId,
                    playerId
                }
            },
            create: {
                gameId,
                playerId,
                ...stats,
                battingAvg,
                slugging,
                obp,
                ops
            },
            update: {
                ...stats,
                battingAvg,
                slugging,
                obp,
                ops
            }
        });
        // Update season stats
        const season = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].playerSeasonStats.findUnique({
            where: {
                playerId
            }
        });
        if (season) {
            const newAB = season.atBats + ab;
            const newH = season.hits + h;
            const newBB = season.walks + bb;
            const newSF = season.sacFlies + sf;
            const newSLG1 = season.singles + stats.singles;
            const newSLG2 = season.doubles + stats.doubles;
            const newSLG3 = season.triples + stats.triples;
            const newHR = season.homeRuns + stats.homeRuns;
            const sAvg = newAB > 0 ? newH / newAB : null;
            const sSlg = newAB > 0 ? (newSLG1 + 2 * newSLG2 + 3 * newSLG3 + 4 * newHR) / newAB : null;
            const sObp = newAB + newBB + newSF > 0 ? (newH + newBB) / (newAB + newBB + newSF) : null;
            const sOps = sObp !== null && sSlg !== null ? sObp + sSlg : null;
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].playerSeasonStats.update({
                where: {
                    playerId
                },
                data: {
                    gamesPlayed: {
                        increment: 1
                    },
                    atBats: {
                        increment: ab
                    },
                    plateAppearances: {
                        increment: pa
                    },
                    hits: {
                        increment: h
                    },
                    singles: {
                        increment: stats.singles
                    },
                    doubles: {
                        increment: stats.doubles
                    },
                    triples: {
                        increment: stats.triples
                    },
                    homeRuns: {
                        increment: stats.homeRuns
                    },
                    rbi: {
                        increment: stats.rbi
                    },
                    runs: {
                        increment: stats.runs
                    },
                    walks: {
                        increment: stats.walks
                    },
                    strikeouts: {
                        increment: stats.strikeouts
                    },
                    sacFlies: {
                        increment: stats.sacFlies
                    },
                    reachedOnError: {
                        increment: stats.reachedOnError
                    },
                    battingAvg: sAvg,
                    slugging: sSlg,
                    obp: sObp,
                    ops: sOps
                }
            });
        }
    }
    // Update team season stats
    const won = game.teamRuns > game.opponentRuns;
    const lost = game.teamRuns < game.opponentRuns;
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].teamSeasonStats.updateMany({
        where: {
            teamId
        },
        data: {
            wins: won ? {
                increment: 1
            } : undefined,
            losses: lost ? {
                increment: 1
            } : undefined,
            runsScored: {
                increment: game.teamRuns
            },
            runsAllowed: {
                increment: game.opponentRuns
            },
            runDiff: {
                increment: game.teamRuns - game.opponentRuns
            }
        }
    });
    // Mark game final
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].game.update({
        where: {
            id: gameId
        },
        data: {
            status: "FINAL",
            completedAt: new Date()
        }
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].playEvent.create({
        data: {
            gameId,
            type: "GAME_END",
            description: "Game ended"
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/scorebook/${gameId}`);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/dashboard");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/schedule");
    return {
        success: true
    };
}
async function restartGame(gameId) {
    const teamId = await getTeamId();
    const game = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].game.findFirst({
        where: {
            id: gameId,
            teamId
        }
    });
    if (!game) return {
        error: "Game not found"
    };
    // Delete all scorebook data for this game
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].playEvent.deleteMany({
        where: {
            gameId
        }
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].plateAppearance.deleteMany({
        where: {
            gameId
        }
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].playerGameStats.deleteMany({
        where: {
            gameId
        }
    });
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].inning.deleteMany({
        where: {
            gameId
        }
    });
    // Reset game scores and status
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].game.update({
        where: {
            id: gameId
        },
        data: {
            status: "SCHEDULED",
            teamRuns: 0,
            opponentRuns: 0,
            teamHits: 0,
            opponentHits: 0,
            teamErrors: 0,
            opponentErrors: 0,
            startedAt: null,
            completedAt: null
        }
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])(`/scorebook/${gameId}`);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/schedule");
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/dashboard");
    return {
        success: true
    };
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    startGame,
    recordPlateAppearance,
    undoLastPlateAppearance,
    updateOpponentScore,
    nextInning,
    endGame,
    restartGame
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(startGame, "406a78936572a9aeec3ff858eca5c5ec5949815a6b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(recordPlateAppearance, "40a1839e23d6df77e108999b77873cb22df769589b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(undoLastPlateAppearance, "4017173fd5205c81177cf591f2df8ea891b68215ac", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateOpponentScore, "70c17100a25bddfc0d7cd44deef733ec304425708b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(nextInning, "60a6df8ac9f85689d30b8da2a58b904d9e62292b4b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(endGame, "4072730a3d602b6f6724f88c3e0d132cad39ffa242", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(restartGame, "40b8bfedb4ef8aeab2a7dee282473765846e67b168", null);
}),
"[project]/.next-internal/server/app/scorebook/[gameId]/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/server/actions/scorebook.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2f$scorebook$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/actions/scorebook.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
}),
"[project]/.next-internal/server/app/scorebook/[gameId]/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/server/actions/scorebook.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "4017173fd5205c81177cf591f2df8ea891b68215ac",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2f$scorebook$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["undoLastPlateAppearance"],
    "406a78936572a9aeec3ff858eca5c5ec5949815a6b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2f$scorebook$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["startGame"],
    "4072730a3d602b6f6724f88c3e0d132cad39ffa242",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2f$scorebook$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["endGame"],
    "40a1839e23d6df77e108999b77873cb22df769589b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2f$scorebook$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["recordPlateAppearance"],
    "40b8bfedb4ef8aeab2a7dee282473765846e67b168",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2f$scorebook$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["restartGame"],
    "60a6df8ac9f85689d30b8da2a58b904d9e62292b4b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2f$scorebook$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["nextInning"],
    "70c17100a25bddfc0d7cd44deef733ec304425708b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2f$scorebook$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateOpponentScore"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$scorebook$2f5b$gameId$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$server$2f$actions$2f$scorebook$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/scorebook/[gameId]/page/actions.js { ACTIONS_MODULE0 => "[project]/src/server/actions/scorebook.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2f$scorebook$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/server/actions/scorebook.ts [app-rsc] (ecmascript)");
}),
"[project]/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/src/components/scorebook/Scorebook.tsx [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "Scorebook",
    ()=>Scorebook
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const Scorebook = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call Scorebook() from the server but Scorebook is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/scorebook/Scorebook.tsx <module evaluation>", "Scorebook");
}),
"[project]/src/components/scorebook/Scorebook.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "Scorebook",
    ()=>Scorebook
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const Scorebook = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call Scorebook() from the server but Scorebook is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/scorebook/Scorebook.tsx", "Scorebook");
}),
"[project]/src/components/scorebook/Scorebook.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$scorebook$2f$Scorebook$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/src/components/scorebook/Scorebook.tsx [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$scorebook$2f$Scorebook$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/components/scorebook/Scorebook.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$scorebook$2f$Scorebook$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/app/scorebook/[gameId]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ScoreboookPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$scorebook$2f$Scorebook$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/scorebook/Scorebook.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
async function ScoreboookPage({ params }) {
    const { gameId } = await params;
    const session = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["auth"])();
    if (!session) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
    const team = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].team.findFirst({
        where: {
            userId: session.user.id
        },
        select: {
            id: true,
            name: true,
            teamColor: true,
            defaultLineup: true
        }
    });
    if (!team) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
    const game = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].game.findFirst({
        where: {
            id: gameId,
            teamId: team.id
        },
        include: {
            innings: {
                orderBy: {
                    inningNumber: "asc"
                }
            },
            lineup: {
                orderBy: {
                    battingOrder: "asc"
                },
                include: {
                    player: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            jerseyNumber: true
                        }
                    }
                }
            },
            plateAppearances: {
                orderBy: {
                    createdAt: "desc"
                },
                take: 50,
                include: {
                    player: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            }
        }
    });
    if (!game) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/schedule");
    let lineup = [];
    if (game.lineup.length > 0) {
        // Game has a saved lineup — try to enrich with inningPositions from defaultLineup
        let savedSlots = [];
        if (team.defaultLineup) {
            try {
                savedSlots = JSON.parse(team.defaultLineup);
            } catch  {}
        }
        lineup = game.lineup.map((slot)=>{
            const saved = savedSlots.find((s)=>s.playerId === slot.playerId);
            return {
                id: slot.id,
                gameId: slot.gameId,
                playerId: slot.playerId,
                battingOrder: slot.battingOrder,
                fieldingPosition: slot.fieldingPosition,
                inningPositions: saved?.inningPositions ?? {},
                player: slot.player
            };
        });
    } else if (team.defaultLineup) {
        // Fall back to default lineup
        try {
            const saved = JSON.parse(team.defaultLineup);
            const players = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["prisma"].player.findMany({
                where: {
                    id: {
                        in: saved.map((s)=>s.playerId)
                    },
                    teamId: team.id
                },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    jerseyNumber: true
                }
            });
            lineup = saved.map((s)=>{
                const player = players.find((p)=>p.id === s.playerId);
                if (!player) return null;
                return {
                    id: `default-${s.playerId}`,
                    gameId,
                    playerId: s.playerId,
                    battingOrder: s.battingOrder,
                    fieldingPosition: s.fieldingPosition ?? "BENCH",
                    inningPositions: s.inningPositions ?? {},
                    player
                };
            }).filter(Boolean);
        } catch  {
            lineup = [];
        }
    }
    const teamColor = team.teamColor ?? "#00e87a";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            fontFamily: "var(--font-body)"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("style", {
                children: `
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `
            }, void 0, false, {
                fileName: "[project]/src/app/scorebook/[gameId]/page.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$scorebook$2f$Scorebook$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Scorebook"], {
                game: {
                    id: game.id,
                    opponent: game.opponent,
                    isHome: game.isHome,
                    status: game.status,
                    teamRuns: game.teamRuns,
                    opponentRuns: game.opponentRuns,
                    totalInnings: game.totalInnings,
                    innings: game.innings,
                    lineup,
                    plateAppearances: game.plateAppearances
                },
                teamName: team.name,
                teamColor: teamColor
            }, void 0, false, {
                fileName: "[project]/src/app/scorebook/[gameId]/page.tsx",
                lineNumber: 122,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/scorebook/[gameId]/page.tsx",
        lineNumber: 115,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/scorebook/[gameId]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/scorebook/[gameId]/page.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__db93ab3a._.js.map