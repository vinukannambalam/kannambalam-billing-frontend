import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";

const menu = [

    {
        title: "Dashboard",
        icon: DashboardIcon,
        path: "/"
    },

    {
        title: "Billing",
        icon: ReceiptLongIcon,

        children: [

            {
                title: "New Receipt",
                path: "/billing/new"
            },

            {
                title: "Search Receipts",
                path: "/receipts"
            }

        ]

    },

    {

        title: "Reports",

        icon: AssessmentIcon,

        children: [

            {
                title: "Dashboard",
                path: "/reports"
            }

        ]

    },

    {

        title: "Masters",

        icon: PeopleIcon,

        children: [

            {
                title: "Devotees",
                path: "/masters/devotees"
            },

            {
                title: "Offerings",
                path: "/masters/offerings"
            },

            {
                title: "Categories",
                path: "/masters/categories"
            },

            {
                title: "Payment Modes",
                path: "/masters/payment-modes"
            }

        ]

    },

    {

        title: "Administration",

        icon: SettingsIcon,

        children: [

            {
                title: "Users",
                path: "/users"
            },

            {
                title: "Settings",
                path: "/settings"
            }

        ]

    }

];

export default menu;