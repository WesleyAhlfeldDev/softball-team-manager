(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/stats/ExportStatsButton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ExportStatsButton",
    ()=>ExportStatsButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$index$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/react-fontawesome/index.es.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/free-solid-svg-icons/index.mjs [app-client] (ecmascript)");
"use client";
;
;
;
function fmt(val) {
    let decimals = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 3;
    if (val == null) return "";
    return val.toFixed(decimals);
}
function ExportStatsButton(param) {
    let { seasonName, players } = param;
    const handleExport = ()=>{
        const headers = [
            "#",
            "Player",
            "G",
            "AB",
            "H",
            "2B",
            "3B",
            "HR",
            "RBI",
            "R",
            "BB",
            "AVG",
            "OBP",
            "SLG",
            "OPS"
        ];
        const rows = players.map((p)=>{
            var _p_jerseyNumber;
            return [
                (_p_jerseyNumber = p.jerseyNumber) !== null && _p_jerseyNumber !== void 0 ? _p_jerseyNumber : "",
                "".concat(p.firstName, " ").concat(p.lastName),
                p.gamesPlayed,
                p.atBats,
                p.hits,
                p.doubles,
                p.triples,
                p.homeRuns,
                p.rbi,
                p.runs,
                p.walks,
                fmt(p.battingAvg),
                fmt(p.obp),
                fmt(p.slugging),
                fmt(p.ops)
            ];
        });
        const csv = [
            headers,
            ...rows
        ].map((row)=>row.map((cell)=>'"'.concat(String(cell).replace(/"/g, '""'), '"')).join(",")).join("\n");
        const blob = new Blob([
            csv
        ], {
            type: "text/csv;charset=utf-8;"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "".concat(seasonName.replace(/\s+/g, "_"), "_stats.csv");
        a.click();
        URL.revokeObjectURL(url);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: handleExport,
        className: "flex items-center gap-2 rounded-lg px-4 py-2.5 font-bold transition-opacity hover:opacity-80",
        style: {
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "#eeeef5",
            fontFamily: "var(--font-display)",
            fontSize: "0.85rem",
            letterSpacing: "0.05em",
            cursor: "pointer"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$index$2e$es$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["faDownload"],
                style: {
                    width: 13,
                    height: 13
                }
            }, void 0, false, {
                fileName: "[project]/src/components/stats/ExportStatsButton.tsx",
                lineNumber: 85,
                columnNumber: 7
            }, this),
            "EXPORT CSV"
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/stats/ExportStatsButton.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
}
_c = ExportStatsButton;
var _c;
__turbopack_context__.k.register(_c, "ExportStatsButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_stats_ExportStatsButton_tsx_faaa9e8b._.js.map