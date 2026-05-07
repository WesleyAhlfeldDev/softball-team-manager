module.exports = [
"[project]/src/components/stats/ExportStatsButton.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ExportStatsButton",
    ()=>ExportStatsButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/react-fontawesome/index.es.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/free-solid-svg-icons/index.mjs [app-ssr] (ecmascript)");
"use client";
;
;
;
function fmt(val, decimals = 3) {
    if (val == null) return "";
    return val.toFixed(decimals);
}
function ExportStatsButton({ seasonName, players }) {
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
            "K",
            "AVG",
            "OBP",
            "SLG",
            "OPS"
        ];
        const rows = players.map((p)=>[
                p.jerseyNumber ?? "",
                `${p.firstName} ${p.lastName}`,
                p.gamesPlayed,
                p.atBats,
                p.hits,
                p.doubles,
                p.triples,
                p.homeRuns,
                p.rbi,
                p.runs,
                p.walks,
                p.strikeouts,
                fmt(p.battingAvg),
                fmt(p.obp),
                fmt(p.slugging),
                fmt(p.ops)
            ]);
        const csv = [
            headers,
            ...rows
        ].map((row)=>row.map((cell)=>`"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([
            csv
        ], {
            type: "text/csv;charset=utf-8;"
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${seasonName.replace(/\s+/g, "_")}_stats.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["faDownload"],
                style: {
                    width: 13,
                    height: 13
                }
            }, void 0, false, {
                fileName: "[project]/src/components/stats/ExportStatsButton.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            "EXPORT CSV"
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/stats/ExportStatsButton.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/server/actions/data:e0efed [app-ssr] (ecmascript) <text/javascript>", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"0053ff2007c793bfa3229e81bce3774d543411ef21":"seedRandomStats"},"src/server/actions/seasons.ts",""] */ __turbopack_context__.s([
    "seedRandomStats",
    ()=>seedRandomStats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)");
"use turbopack no side effects";
;
var seedRandomStats = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createServerReference"])("0053ff2007c793bfa3229e81bce3774d543411ef21", __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["callServer"], void 0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$client$2d$wrapper$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findSourceMapURL"], "seedRandomStats"); //# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4vc2Vhc29ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzZXJ2ZXJcIjtcblxuaW1wb3J0IHsgcHJpc21hIH0gZnJvbSBcIkAvbGliL2RiXCI7XG5pbXBvcnQgeyBhdXRoIH0gZnJvbSBcIkAvbGliL2F1dGhcIjtcbmltcG9ydCB7IHJldmFsaWRhdGVQYXRoIH0gZnJvbSBcIm5leHQvY2FjaGVcIjtcbmltcG9ydCB7IHogfSBmcm9tIFwiem9kXCI7XG5cbmFzeW5jIGZ1bmN0aW9uIGdldFRlYW1JZCgpIHtcbiAgY29uc3Qgc2Vzc2lvbiA9IGF3YWl0IGF1dGgoKTtcbiAgaWYgKCFzZXNzaW9uPy51c2VyPy5pZCkgdGhyb3cgbmV3IEVycm9yKFwiVW5hdXRob3JpemVkXCIpO1xuICBjb25zdCB0ZWFtID0gYXdhaXQgcHJpc21hLnRlYW0uZmluZEZpcnN0KHtcbiAgICB3aGVyZTogeyB1c2VySWQ6IHNlc3Npb24udXNlci5pZCB9LFxuICAgIHNlbGVjdDogeyBpZDogdHJ1ZSB9LFxuICB9KTtcbiAgaWYgKCF0ZWFtKSB0aHJvdyBuZXcgRXJyb3IoXCJObyB0ZWFtIGZvdW5kXCIpO1xuICByZXR1cm4gdGVhbS5pZDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldFNlYXNvbnMoKSB7XG4gIGNvbnN0IHRlYW1JZCA9IGF3YWl0IGdldFRlYW1JZCgpO1xuICByZXR1cm4gcHJpc21hLnNlYXNvbi5maW5kTWFueSh7XG4gICAgd2hlcmU6IHsgdGVhbUlkIH0sXG4gICAgb3JkZXJCeTogeyBjcmVhdGVkQXQ6IFwiZGVzY1wiIH0sXG4gIH0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY3JlYXRlU2Vhc29uKGZvcm1EYXRhOiBGb3JtRGF0YSkge1xuICBjb25zdCB0ZWFtSWQgPSBhd2FpdCBnZXRUZWFtSWQoKTtcblxuICBjb25zdCBwYXJzZWQgPSB6XG4gICAgLnN0cmluZygpXG4gICAgLm1pbigxLCBcIlNlYXNvbiBuYW1lIGlzIHJlcXVpcmVkXCIpXG4gICAgLm1heCg1MCwgXCJTZWFzb24gbmFtZSBtdXN0IGJlIDUwIGNoYXJhY3RlcnMgb3IgbGVzc1wiKVxuICAgIC5zYWZlUGFyc2UoZm9ybURhdGEuZ2V0KFwibmFtZVwiKSk7XG5cbiAgaWYgKCFwYXJzZWQuc3VjY2Vzcykge1xuICAgIHJldHVybiB7IGVycm9yOiBwYXJzZWQuZXJyb3IuZXJyb3JzWzBdPy5tZXNzYWdlID8/IFwiSW52YWxpZCBuYW1lXCIgfTtcbiAgfVxuXG4gIGF3YWl0IHByaXNtYS5zZWFzb24udXBkYXRlTWFueSh7XG4gICAgd2hlcmU6IHsgdGVhbUlkIH0sXG4gICAgZGF0YTogeyBpc0FjdGl2ZTogZmFsc2UgfSxcbiAgfSk7XG5cbiAgYXdhaXQgcHJpc21hLnNlYXNvbi5jcmVhdGUoe1xuICAgIGRhdGE6IHsgdGVhbUlkLCBuYW1lOiBwYXJzZWQuZGF0YS50cmltKCksIGlzQWN0aXZlOiB0cnVlIH0sXG4gIH0pO1xuXG4gIHJldmFsaWRhdGVQYXRoKFwiL2Rhc2hib2FyZFwiKTtcbiAgcmV2YWxpZGF0ZVBhdGgoXCIvc2NoZWR1bGVcIik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJlc2V0U2Vhc29uKCkge1xuICBjb25zdCB0ZWFtSWQgPSBhd2FpdCBnZXRUZWFtSWQoKTtcblxuICBjb25zdCBhY3RpdmUgPSBhd2FpdCBwcmlzbWEuc2Vhc29uLmZpbmRGaXJzdCh7XG4gICAgd2hlcmU6IHsgdGVhbUlkLCBpc0FjdGl2ZTogdHJ1ZSB9LFxuICAgIHNlbGVjdDogeyBpZDogdHJ1ZSB9LFxuICB9KTtcbiAgaWYgKCFhY3RpdmUpIHJldHVybiB7IGVycm9yOiBcIk5vIGFjdGl2ZSBzZWFzb24gdG8gcmVzZXRcIiB9O1xuXG4gIGF3YWl0IHByaXNtYS5nYW1lLmRlbGV0ZU1hbnkoeyB3aGVyZTogeyBzZWFzb25JZDogYWN0aXZlLmlkIH0gfSk7XG4gIGF3YWl0IHByaXNtYS5wbGF5ZXJTZWFzb25TdGF0cy5kZWxldGVNYW55KHsgd2hlcmU6IHsgc2Vhc29uSWQ6IGFjdGl2ZS5pZCB9IH0pO1xuICBhd2FpdCBwcmlzbWEudGVhbVNlYXNvblN0YXRzLmRlbGV0ZU1hbnkoeyB3aGVyZTogeyBzZWFzb25JZDogYWN0aXZlLmlkIH0gfSk7XG5cbiAgcmV2YWxpZGF0ZVBhdGgoXCIvZGFzaGJvYXJkXCIpO1xuICByZXZhbGlkYXRlUGF0aChcIi9zY2hlZHVsZVwiKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZmluaXNoU2Vhc29uKCkge1xuICBjb25zdCB0ZWFtSWQgPSBhd2FpdCBnZXRUZWFtSWQoKTtcblxuICBjb25zdCBhY3RpdmUgPSBhd2FpdCBwcmlzbWEuc2Vhc29uLmZpbmRGaXJzdCh7XG4gICAgd2hlcmU6IHsgdGVhbUlkLCBpc0FjdGl2ZTogdHJ1ZSB9LFxuICB9KTtcbiAgaWYgKCFhY3RpdmUpIHJldHVybiB7IGVycm9yOiBcIk5vIGFjdGl2ZSBzZWFzb24gdG8gZmluaXNoXCIgfTtcblxuICBhd2FpdCBwcmlzbWEuc2Vhc29uLnVwZGF0ZSh7XG4gICAgd2hlcmU6IHsgaWQ6IGFjdGl2ZS5pZCB9LFxuICAgIGRhdGE6IHsgaXNBY3RpdmU6IGZhbHNlLCBpc0ZpbmlzaGVkOiB0cnVlIH0sXG4gIH0pO1xuXG4gIHJldmFsaWRhdGVQYXRoKFwiL2Rhc2hib2FyZFwiKTtcbiAgcmV2YWxpZGF0ZVBhdGgoXCIvc2NoZWR1bGVcIik7XG4gIHJldHVybiB7IHN1Y2Nlc3M6IHRydWUgfTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNsZWFyU3RhdHMoKSB7XG4gIGNvbnN0IHRlYW1JZCA9IGF3YWl0IGdldFRlYW1JZCgpO1xuXG4gIGNvbnN0IGFjdGl2ZSA9IGF3YWl0IHByaXNtYS5zZWFzb24uZmluZEZpcnN0KHtcbiAgICB3aGVyZTogeyB0ZWFtSWQsIGlzQWN0aXZlOiB0cnVlIH0sXG4gICAgc2VsZWN0OiB7IGlkOiB0cnVlIH0sXG4gIH0pO1xuICBpZiAoIWFjdGl2ZSkgcmV0dXJuIHsgZXJyb3I6IFwiTm8gYWN0aXZlIHNlYXNvblwiIH07XG5cbiAgYXdhaXQgcHJpc21hLnBsYXllclNlYXNvblN0YXRzLmRlbGV0ZU1hbnkoeyB3aGVyZTogeyBzZWFzb25JZDogYWN0aXZlLmlkIH0gfSk7XG4gIGF3YWl0IHByaXNtYS50ZWFtU2Vhc29uU3RhdHMuZGVsZXRlTWFueSh7IHdoZXJlOiB7IHNlYXNvbklkOiBhY3RpdmUuaWQgfSB9KTtcblxuICByZXZhbGlkYXRlUGF0aChcIi9zdGF0c1wiKTtcbiAgcmV2YWxpZGF0ZVBhdGgoXCIvZGFzaGJvYXJkXCIpO1xuICByZXR1cm4geyBzdWNjZXNzOiB0cnVlIH07XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZWVkUmFuZG9tU3RhdHMoKSB7XG4gIGNvbnN0IHRlYW1JZCA9IGF3YWl0IGdldFRlYW1JZCgpO1xuXG4gIGNvbnN0IGFjdGl2ZSA9IGF3YWl0IHByaXNtYS5zZWFzb24uZmluZEZpcnN0KHtcbiAgICB3aGVyZTogeyB0ZWFtSWQsIGlzQWN0aXZlOiB0cnVlIH0sXG4gICAgc2VsZWN0OiB7IGlkOiB0cnVlIH0sXG4gIH0pO1xuICBpZiAoIWFjdGl2ZSkgcmV0dXJuIHsgZXJyb3I6IFwiTm8gYWN0aXZlIHNlYXNvblwiIH07XG5cbiAgY29uc3QgcGxheWVycyA9IGF3YWl0IHByaXNtYS5wbGF5ZXIuZmluZE1hbnkoe1xuICAgIHdoZXJlOiB7IHRlYW1JZCwgaXNBY3RpdmU6IHRydWUgfSxcbiAgICBzZWxlY3Q6IHsgaWQ6IHRydWUgfSxcbiAgfSk7XG4gIGlmIChwbGF5ZXJzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHsgZXJyb3I6IFwiTm8gYWN0aXZlIHBsYXllcnMgb24gcm9zdGVyXCIgfTtcblxuICBjb25zdCByYW5kID0gKG1pbjogbnVtYmVyLCBtYXg6IG51bWJlcikgPT5cbiAgICBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuXG4gIGxldCB0b3RhbFdpbnMgPSByYW5kKDQsIDEwKTtcbiAgbGV0IHRvdGFsTG9zc2VzID0gcmFuZCgyLCA4KTtcbiAgY29uc3QgdG90YWxHYW1lcyA9IHRvdGFsV2lucyArIHRvdGFsTG9zc2VzO1xuICBsZXQgdGVhbVJ1bnNTY29yZWQgPSAwO1xuICBsZXQgdGVhbVJ1bnNBbGxvd2VkID0gMDtcblxuICBmb3IgKGNvbnN0IHsgaWQ6IHBsYXllcklkIH0gb2YgcGxheWVycykge1xuICAgIGNvbnN0IGdhbWVzUGxheWVkID0gcmFuZChNYXRoLm1heCgxLCB0b3RhbEdhbWVzIC0gMyksIHRvdGFsR2FtZXMpO1xuICAgIGNvbnN0IGF0QmF0cyAgICAgID0gcmFuZChnYW1lc1BsYXllZCAqIDMsIGdhbWVzUGxheWVkICogNCk7XG4gICAgY29uc3QgYXZnVGVudGhzICAgPSByYW5kKDE1MCwgMzgwKTtcbiAgICBjb25zdCBoaXRzICAgICAgICA9IE1hdGgucm91bmQoKGF2Z1RlbnRocyAvIDEwMDApICogYXRCYXRzKTtcbiAgICBjb25zdCBkb3VibGVzICAgICA9IHJhbmQoMCwgTWF0aC5mbG9vcihoaXRzICogMC4yNSkpO1xuICAgIGNvbnN0IHRyaXBsZXMgICAgID0gcmFuZCgwLCBNYXRoLm1pbigyLCBNYXRoLmZsb29yKGhpdHMgKiAwLjA1KSkpO1xuICAgIGNvbnN0IGhvbWVSdW5zICAgID0gcmFuZCgwLCBNYXRoLmZsb29yKGhpdHMgKiAwLjE4KSk7XG4gICAgY29uc3Qgc2luZ2xlcyAgICAgPSBNYXRoLm1heCgwLCBoaXRzIC0gZG91YmxlcyAtIHRyaXBsZXMgLSBob21lUnVucyk7XG4gICAgY29uc3QgcmJpICAgICAgICAgPSByYW5kKE1hdGguZmxvb3IoaGl0cyAqIDAuMyksIE1hdGguZmxvb3IoaGl0cyAqIDAuOSkpO1xuICAgIGNvbnN0IHJ1bnMgICAgICAgID0gcmFuZChNYXRoLmZsb29yKGhpdHMgKiAwLjMpLCBNYXRoLmZsb29yKGhpdHMgKiAwLjgpKTtcbiAgICBjb25zdCB3YWxrcyAgICAgICA9IHJhbmQoMCwgTWF0aC5mbG9vcihhdEJhdHMgKiAwLjE1KSk7XG4gICAgY29uc3Qgc3RyaWtlb3V0cyAgPSByYW5kKDAsIE1hdGguZmxvb3IoYXRCYXRzICogMC4yKSk7XG4gICAgY29uc3QgdG90YWxCYXNlcyAgPSBzaW5nbGVzICsgZG91YmxlcyAqIDIgKyB0cmlwbGVzICogMyArIGhvbWVSdW5zICogNDtcblxuICAgIHRlYW1SdW5zU2NvcmVkICs9IHJ1bnM7XG5cbiAgICBjb25zdCBiYXR0aW5nQXZnID0gYXRCYXRzID4gMCA/IGhpdHMgLyBhdEJhdHMgOiAwO1xuICAgIGNvbnN0IG9icCAgICAgICAgPSAoYXRCYXRzICsgd2Fsa3MpID4gMCA/IChoaXRzICsgd2Fsa3MpIC8gKGF0QmF0cyArIHdhbGtzKSA6IDA7XG4gICAgY29uc3Qgc2x1Z2dpbmcgICA9IGF0QmF0cyA+IDAgPyB0b3RhbEJhc2VzIC8gYXRCYXRzIDogMDtcbiAgICBjb25zdCBvcHMgICAgICAgID0gb2JwICsgc2x1Z2dpbmc7XG5cbiAgICBhd2FpdCBwcmlzbWEucGxheWVyU2Vhc29uU3RhdHMudXBzZXJ0KHtcbiAgICAgIHdoZXJlOiB7IHBsYXllcklkX3NlYXNvbklkOiB7IHBsYXllcklkLCBzZWFzb25JZDogYWN0aXZlLmlkIH0gfSxcbiAgICAgIGNyZWF0ZToge1xuICAgICAgICBwbGF5ZXJJZCxcbiAgICAgICAgc2Vhc29uSWQ6IGFjdGl2ZS5pZCxcbiAgICAgICAgZ2FtZXNQbGF5ZWQsIGF0QmF0cywgaGl0cywgZG91YmxlcywgdHJpcGxlcywgaG9tZVJ1bnMsIHJiaSwgcnVucywgd2Fsa3MsIHN0cmlrZW91dHMsXG4gICAgICAgIGJhdHRpbmdBdmcsIG9icCwgc2x1Z2dpbmcsIG9wcyxcbiAgICAgIH0sXG4gICAgICB1cGRhdGU6IHtcbiAgICAgICAgZ2FtZXNQbGF5ZWQsIGF0QmF0cywgaGl0cywgZG91YmxlcywgdHJpcGxlcywgaG9tZVJ1bnMsIHJiaSwgcnVucywgd2Fsa3MsIHN0cmlrZW91dHMsXG4gICAgICAgIGJhdHRpbmdBdmcsIG9icCwgc2x1Z2dpbmcsIG9wcyxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH1cblxuICB0ZWFtUnVuc0FsbG93ZWQgPSByYW5kKFxuICAgIE1hdGguZmxvb3IodGVhbVJ1bnNTY29yZWQgKiAwLjUpLFxuICAgIE1hdGguZmxvb3IodGVhbVJ1bnNTY29yZWQgKiAxLjIpLFxuICApO1xuXG4gIGF3YWl0IHByaXNtYS50ZWFtU2Vhc29uU3RhdHMudXBzZXJ0KHtcbiAgICB3aGVyZTogeyBzZWFzb25JZDogYWN0aXZlLmlkIH0sXG4gICAgY3JlYXRlOiB7XG4gICAgICBzZWFzb25JZDogYWN0aXZlLmlkLFxuICAgICAgd2luczogdG90YWxXaW5zLFxuICAgICAgbG9zc2VzOiB0b3RhbExvc3NlcyxcbiAgICAgIHJ1bnNTY29yZWQ6IHRlYW1SdW5zU2NvcmVkLFxuICAgICAgcnVuc0FsbG93ZWQ6IHRlYW1SdW5zQWxsb3dlZCxcbiAgICB9LFxuICAgIHVwZGF0ZToge1xuICAgICAgd2luczogdG90YWxXaW5zLFxuICAgICAgbG9zc2VzOiB0b3RhbExvc3NlcyxcbiAgICAgIHJ1bnNTY29yZWQ6IHRlYW1SdW5zU2NvcmVkLFxuICAgICAgcnVuc0FsbG93ZWQ6IHRlYW1SdW5zQWxsb3dlZCxcbiAgICB9LFxuICB9KTtcblxuICByZXZhbGlkYXRlUGF0aChcIi9zdGF0c1wiKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0QWN0aXZlU2Vhc29uKHNlYXNvbklkOiBzdHJpbmcpIHtcbiAgY29uc3QgdGVhbUlkID0gYXdhaXQgZ2V0VGVhbUlkKCk7XG5cbiAgY29uc3Qgc2Vhc29uID0gYXdhaXQgcHJpc21hLnNlYXNvbi5maW5kRmlyc3Qoe1xuICAgIHdoZXJlOiB7IGlkOiBzZWFzb25JZCwgdGVhbUlkIH0sXG4gIH0pO1xuICBpZiAoIXNlYXNvbikgcmV0dXJuIHsgZXJyb3I6IFwiU2Vhc29uIG5vdCBmb3VuZFwiIH07XG5cbiAgYXdhaXQgcHJpc21hLnNlYXNvbi51cGRhdGVNYW55KHtcbiAgICB3aGVyZTogeyB0ZWFtSWQgfSxcbiAgICBkYXRhOiB7IGlzQWN0aXZlOiBmYWxzZSB9LFxuICB9KTtcbiAgYXdhaXQgcHJpc21hLnNlYXNvbi51cGRhdGUoe1xuICAgIHdoZXJlOiB7IGlkOiBzZWFzb25JZCB9LFxuICAgIGRhdGE6IHsgaXNBY3RpdmU6IHRydWUgfSxcbiAgfSk7XG5cbiAgcmV2YWxpZGF0ZVBhdGgoXCIvZGFzaGJvYXJkXCIpO1xuICByZXZhbGlkYXRlUGF0aChcIi9zY2hlZHVsZVwiKTtcbiAgcmV0dXJuIHsgc3VjY2VzczogdHJ1ZSB9O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJzU0EwR3NCIn0=
}),
"[project]/src/components/stats/GenerateTestDataButton.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GenerateTestDataButton",
    ()=>GenerateTestDataButton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/react-fontawesome/index.es.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/free-solid-svg-icons/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2f$data$3a$e0efed__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__ = __turbopack_context__.i("[project]/src/server/actions/data:e0efed [app-ssr] (ecmascript) <text/javascript>");
"use client";
;
;
;
;
;
function GenerateTestDataButton() {
    const [confirming, setConfirming] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isPending, startTransition] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useTransition"])();
    const handleConfirm = ()=>{
        startTransition(async ()=>{
            const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$server$2f$actions$2f$data$3a$e0efed__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$text$2f$javascript$3e$__["seedRandomStats"])();
            if (result?.error) {
                alert(result.error);
            }
            setConfirming(false);
        });
    };
    if (confirming) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex flex-col items-center gap-3",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    style: {
                        color: "rgba(238,238,245,0.6)",
                        margin: 0,
                        fontSize: "0.875rem"
                    },
                    children: "This will overwrite any existing stats for all active players."
                }, void 0, false, {
                    fileName: "[project]/src/components/stats/GenerateTestDataButton.tsx",
                    lineNumber: 25,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleConfirm,
                            disabled: isPending,
                            className: "rounded-lg px-4 py-2 font-bold transition-opacity hover:opacity-80",
                            style: {
                                background: "#00e87a",
                                color: "#0a0a0f",
                                border: "none",
                                fontFamily: "var(--font-display)",
                                fontSize: "0.85rem",
                                letterSpacing: "0.05em",
                                cursor: isPending ? "default" : "pointer",
                                opacity: isPending ? 0.6 : 1
                            },
                            children: isPending ? "Generating…" : "Yes, generate"
                        }, void 0, false, {
                            fileName: "[project]/src/components/stats/GenerateTestDataButton.tsx",
                            lineNumber: 29,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: ()=>setConfirming(false),
                            disabled: isPending,
                            className: "rounded-lg px-4 py-2 font-bold transition-opacity hover:opacity-80",
                            style: {
                                background: "rgba(255,255,255,0.08)",
                                color: "#eeeef5",
                                border: "1px solid rgba(255,255,255,0.12)",
                                fontFamily: "var(--font-display)",
                                fontSize: "0.85rem",
                                letterSpacing: "0.05em",
                                cursor: "pointer"
                            },
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/src/components/stats/GenerateTestDataButton.tsx",
                            lineNumber: 46,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/stats/GenerateTestDataButton.tsx",
                    lineNumber: 28,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/stats/GenerateTestDataButton.tsx",
            lineNumber: 24,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
        type: "button",
        onClick: ()=>setConfirming(true),
        className: "flex items-center gap-2 rounded-lg px-4 py-2.5 font-bold transition-opacity hover:opacity-80",
        style: {
            background: "rgba(0,232,122,0.1)",
            border: "1px solid rgba(0,232,122,0.25)",
            color: "#00e87a",
            fontFamily: "var(--font-display)",
            fontSize: "0.85rem",
            letterSpacing: "0.05em",
            cursor: "pointer"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["faFlask"],
                style: {
                    width: 13,
                    height: 13
                }
            }, void 0, false, {
                fileName: "[project]/src/components/stats/GenerateTestDataButton.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            "GENERATE TEST DATA"
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/stats/GenerateTestDataButton.tsx",
        lineNumber: 68,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/stats/StatsTable.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "StatsTable",
    ()=>StatsTable
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/react-fontawesome/index.es.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@fortawesome/free-solid-svg-icons/index.mjs [app-ssr] (ecmascript)");
"use client";
;
;
;
;
function fmtAvg(val) {
    if (val == null) return "—";
    return val.toFixed(3).replace(/^0/, "");
}
function fmtStat(val) {
    if (val == null) return "—";
    return val.toString();
}
function getValue(ps, key) {
    switch(key){
        case "jersey":
            return ps.player.jerseyNumber ?? "";
        case "name":
            return `${ps.player.lastName} ${ps.player.firstName}`.toLowerCase();
        case "g":
            return ps.gamesPlayed;
        case "ab":
            return ps.atBats;
        case "h":
            return ps.hits;
        case "2b":
            return ps.doubles;
        case "3b":
            return ps.triples;
        case "hr":
            return ps.homeRuns;
        case "rbi":
            return ps.rbi;
        case "r":
            return ps.runs;
        case "bb":
            return ps.walks;
        case "k":
            return ps.strikeouts;
        case "avg":
            return ps.battingAvg;
        case "obp":
            return ps.obp;
        case "slg":
            return ps.slugging;
        case "ops":
            return ps.ops;
    }
}
const COLUMNS = [
    {
        label: "#",
        key: "jersey",
        align: "center"
    },
    {
        label: "Player",
        key: "name",
        align: "left"
    },
    {
        label: "G",
        key: "g",
        align: "center"
    },
    {
        label: "AB",
        key: "ab",
        align: "center"
    },
    {
        label: "H",
        key: "h",
        align: "center"
    },
    {
        label: "2B",
        key: "2b",
        align: "center"
    },
    {
        label: "3B",
        key: "3b",
        align: "center"
    },
    {
        label: "HR",
        key: "hr",
        align: "center"
    },
    {
        label: "RBI",
        key: "rbi",
        align: "center"
    },
    {
        label: "R",
        key: "r",
        align: "center"
    },
    {
        label: "BB",
        key: "bb",
        align: "center"
    },
    {
        label: "K",
        key: "k",
        align: "center"
    },
    {
        label: "AVG",
        key: "avg",
        align: "center"
    },
    {
        label: "OBP",
        key: "obp",
        align: "center"
    },
    {
        label: "SLG",
        key: "slg",
        align: "center"
    },
    {
        label: "OPS",
        key: "ops",
        align: "center"
    }
];
function StatsTable({ players, teamColor }) {
    const [sortKey, setSortKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("avg");
    const [sortDir, setSortDir] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])("desc");
    const handleSort = (key)=>{
        if (key === sortKey) {
            setSortDir((d)=>d === "desc" ? "asc" : "desc");
        } else {
            setSortKey(key);
            setSortDir("desc");
        }
    };
    const sorted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return [
            ...players
        ].sort((a, b)=>{
            const av = getValue(a, sortKey);
            const bv = getValue(b, sortKey);
            // nulls / empty always last
            if (av == null || av === "") return 1;
            if (bv == null || bv === "") return -1;
            let cmp = 0;
            if (typeof av === "string" && typeof bv === "string") {
                cmp = av.localeCompare(bv);
            } else {
                cmp = av - bv;
            }
            return sortDir === "desc" ? -cmp : cmp;
        });
    }, [
        players,
        sortKey,
        sortDir
    ]);
    const maxAvg = Math.max(...players.map((p)=>p.battingAvg ?? -1));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "card overflow-x-auto p-0",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            style: {
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 700
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                        style: {
                            borderBottom: "1px solid var(--color-border-subtle)",
                            background: "rgba(255,255,255,0.02)"
                        },
                        children: COLUMNS.map((col)=>{
                            const isActive = sortKey === col.key;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                onClick: ()=>handleSort(col.key),
                                className: "px-3 py-3",
                                style: {
                                    fontFamily: "var(--font-body)",
                                    fontSize: "0.6875rem",
                                    fontWeight: 700,
                                    letterSpacing: "0.1em",
                                    textTransform: "uppercase",
                                    color: isActive ? teamColor : "rgba(238,238,245,0.4)",
                                    textAlign: col.align,
                                    whiteSpace: "nowrap",
                                    cursor: "pointer",
                                    userSelect: "none",
                                    transition: "color 0.15s"
                                },
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    style: {
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: 4
                                    },
                                    children: [
                                        col.label,
                                        isActive ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$react$2d$fontawesome$2f$index$2e$es$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FontAwesomeIcon"], {
                                            icon: sortDir === "desc" ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["faCaretDown"] : __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$fortawesome$2f$free$2d$solid$2d$svg$2d$icons$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["faCaretUp"],
                                            style: {
                                                width: 8,
                                                height: 8,
                                                opacity: 0.9
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/stats/StatsTable.tsx",
                                            lineNumber: 154,
                                            columnNumber: 23
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            style: {
                                                width: 8,
                                                display: "inline-block"
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/stats/StatsTable.tsx",
                                            lineNumber: 159,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/stats/StatsTable.tsx",
                                    lineNumber: 151,
                                    columnNumber: 19
                                }, this)
                            }, col.key, false, {
                                fileName: "[project]/src/components/stats/StatsTable.tsx",
                                lineNumber: 133,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/components/stats/StatsTable.tsx",
                        lineNumber: 126,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/stats/StatsTable.tsx",
                    lineNumber: 125,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                    children: sorted.map((ps)=>{
                        const name = `${ps.player.firstName} ${ps.player.lastName}`;
                        const isLeader = ps.battingAvg != null && ps.battingAvg === maxAvg;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                            style: {
                                borderBottom: "1px solid var(--color-border-subtle)",
                                opacity: ps.player.isActive ? 1 : 0.5
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-3 py-3",
                                    style: {
                                        textAlign: "center",
                                        fontFamily: "var(--font-mono)",
                                        fontSize: "0.8rem",
                                        color: "var(--color-text-muted)"
                                    },
                                    children: ps.player.jerseyNumber ?? "—"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/stats/StatsTable.tsx",
                                    lineNumber: 179,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-3 py-3",
                                    style: {
                                        whiteSpace: "nowrap"
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        style: {
                                            fontFamily: "var(--font-display)",
                                            fontWeight: 700,
                                            fontSize: "0.9rem",
                                            color: "#eeeef5"
                                        },
                                        children: name
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/stats/StatsTable.tsx",
                                        lineNumber: 186,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/stats/StatsTable.tsx",
                                    lineNumber: 185,
                                    columnNumber: 17
                                }, this),
                                [
                                    ps.gamesPlayed,
                                    ps.atBats,
                                    ps.hits,
                                    ps.doubles,
                                    ps.triples,
                                    ps.homeRuns,
                                    ps.rbi,
                                    ps.runs,
                                    ps.walks,
                                    ps.strikeouts
                                ].map((val, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                        className: "px-3 py-3",
                                        style: {
                                            textAlign: "center",
                                            fontFamily: "var(--font-mono)",
                                            fontSize: "0.85rem",
                                            color: "var(--color-text-secondary)"
                                        },
                                        children: fmtStat(val)
                                    }, i, false, {
                                        fileName: "[project]/src/components/stats/StatsTable.tsx",
                                        lineNumber: 199,
                                        columnNumber: 19
                                    }, this)),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-3 py-3",
                                    style: {
                                        textAlign: "center",
                                        fontFamily: "var(--font-mono)",
                                        fontSize: "0.85rem",
                                        fontWeight: isLeader ? 700 : 400,
                                        color: isLeader ? teamColor : "var(--color-text-secondary)"
                                    },
                                    children: fmtAvg(ps.battingAvg)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/stats/StatsTable.tsx",
                                    lineNumber: 208,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-3 py-3",
                                    style: {
                                        textAlign: "center",
                                        fontFamily: "var(--font-mono)",
                                        fontSize: "0.85rem",
                                        color: "var(--color-text-secondary)"
                                    },
                                    children: fmtAvg(ps.obp)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/stats/StatsTable.tsx",
                                    lineNumber: 214,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-3 py-3",
                                    style: {
                                        textAlign: "center",
                                        fontFamily: "var(--font-mono)",
                                        fontSize: "0.85rem",
                                        color: "var(--color-text-secondary)"
                                    },
                                    children: fmtAvg(ps.slugging)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/stats/StatsTable.tsx",
                                    lineNumber: 219,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                    className: "px-3 py-3",
                                    style: {
                                        textAlign: "center",
                                        fontFamily: "var(--font-mono)",
                                        fontSize: "0.85rem",
                                        color: "var(--color-text-secondary)"
                                    },
                                    children: ps.ops != null ? ps.ops.toFixed(3) : "—"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/stats/StatsTable.tsx",
                                    lineNumber: 224,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, ps.id, true, {
                            fileName: "[project]/src/components/stats/StatsTable.tsx",
                            lineNumber: 172,
                            columnNumber: 15
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/components/stats/StatsTable.tsx",
                    lineNumber: 167,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/stats/StatsTable.tsx",
            lineNumber: 124,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/stats/StatsTable.tsx",
        lineNumber: 123,
        columnNumber: 5
    }, this);
}
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-client-wrapper.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// This file must be bundled in the app's client layer, it shouldn't be directly
// imported by the server.
Object.defineProperty(exports, "__esModule", {
    value: true
});
0 && (module.exports = {
    callServer: null,
    createServerReference: null,
    findSourceMapURL: null
});
function _export(target, all) {
    for(var name in all)Object.defineProperty(target, name, {
        enumerable: true,
        get: all[name]
    });
}
_export(exports, {
    callServer: function() {
        return _appcallserver.callServer;
    },
    createServerReference: function() {
        return _client.createServerReference;
    },
    findSourceMapURL: function() {
        return _appfindsourcemapurl.findSourceMapURL;
    }
});
const _appcallserver = __turbopack_context__.r("[project]/node_modules/next/dist/client/app-call-server.js [app-ssr] (ecmascript)");
const _appfindsourcemapurl = __turbopack_context__.r("[project]/node_modules/next/dist/client/app-find-source-map-url.js [app-ssr] (ecmascript)");
const _client = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-server-dom-turbopack-client.js [app-ssr] (ecmascript)"); //# sourceMappingURL=action-client-wrapper.js.map
}),
];

//# sourceMappingURL=_0dc8b16c._.js.map