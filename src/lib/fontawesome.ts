/**
 * Font Awesome Library Setup
 *
 * Import and register all icons here. This prevents tree-shaking issues
 * and gives you one place to add/remove icons from the bundle.
 *
 * Usage in components:
 *   import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
 *   import { faBolt } from "@fortawesome/free-solid-svg-icons";
 *   <FontAwesomeIcon icon={faBolt} />
 *
 * OR use the string shorthand after library.add() is called:
 *   <FontAwesomeIcon icon={["fas", "bolt"]} />
 */

import { library } from "@fortawesome/fontawesome-svg-core";
import { config } from "@fortawesome/fontawesome-svg-core";

// Prevent FA from injecting its own CSS — Next.js handles this
config.autoAddCss = false;

// ── Solid icons (fas) ──────────────────────────────────────────
import {
  // Nav & UI
  faHouse,
  faUsers,
  faCalendarDays,
  faListOl,
  faGear,
  faRightFromBracket,
  faBars,
  faXmark,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faChevronUp,
  faEllipsisVertical,
  faPlus,
  faPencil,
  faTrash,
  faCheck,
  faArrowUp,
  faArrowDown,
  faMagnifyingGlass,
  faFilter,
  // Game / scorebook
  faBolt,           // Go Live
  faCircle,         // Live dot
  faTrophy,         // Win
  faStopwatch,      // Timer / period
  faFlag,           // Foul
  faRotateLeft,     // Undo
  faForwardStep,    // Next period
  faStop,           // End game
  faBasketball,
  faFutbol,
  faBaseballBatBall,
  // Players
  faShirt,          // Jersey
  faPersonRunning,
  faStar,           // Starter
  // Schedule
  faLocationDot,
  faHome,
  faPlaneUp,        // Away game
  faClock,
  // Auth
  faLock,
  faEye,
  faEyeSlash,
  faShieldHalved,
  // Feedback
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
  faCircleInfo,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

// ── Regular icons (far) ────────────────────────────────────────
import {
  faCalendar,
  faCircle as faCircleRegular,
  faStar as faStarRegular,
  faUser,
  faClipboard,
} from "@fortawesome/free-regular-svg-icons";

// ── Brand icons (fab) ──────────────────────────────────────────
import { faGithub, faGoogle } from "@fortawesome/free-brands-svg-icons";

// Register everything
library.add(
  // Solid
  faHouse, faUsers, faCalendarDays, faListOl, faGear, faRightFromBracket,
  faBars, faXmark, faChevronLeft, faChevronRight, faChevronDown, faChevronUp,
  faEllipsisVertical, faPlus, faPencil, faTrash, faCheck,
  faArrowUp, faArrowDown, faMagnifyingGlass, faFilter,
  faBolt, faCircle, faTrophy, faStopwatch, faFlag, faRotateLeft,
  faForwardStep, faStop, faBasketball, faFutbol, faBaseballBatBall,
  faShirt, faPersonRunning, faStar,
  faLocationDot, faHome, faPlaneUp, faClock,
  faLock, faEye, faEyeSlash, faShieldHalved,
  faCircleCheck, faCircleXmark, faTriangleExclamation, faCircleInfo, faSpinner,
  // Regular
  faCalendar, faCircleRegular, faStarRegular, faUser, faClipboard,
  // Brands
  faGithub, faGoogle,
);

// Re-export FontAwesomeIcon for convenience
export { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Export commonly used icon objects so you don't re-import everywhere
export {
  faBolt,
  faUsers,
  faCalendarDays,
  faListOl,
  faHouse,
  faGear,
  faRightFromBracket,
  faPlus,
  faPencil,
  faTrash,
  faCheck,
  faXmark,
  faChevronLeft,
  faChevronRight,
  faFlag,
  faRotateLeft,
  faForwardStep,
  faStop,
  faTrophy,
  faStopwatch,
  faCircleCheck,
  faCircleXmark,
  faTriangleExclamation,
  faCircleInfo,
  faSpinner,
  faShirt,
  faLocationDot,
  faLock,
  faEye,
  faEyeSlash,
  faArrowUp,
  faArrowDown,
};
