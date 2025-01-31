import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilLanguage,
  cilNotes,
  cilSettings,
  cilPuzzle,
  cilSpeedometer,
  cilStar,
  cilBasket,
  cilNewspaper,
  cilTruck,
  cilUser,
  cilEnvelopeClosed,
  cilBadge,
  cilDiamond,
  cilChatBubble,
  cilImage,
  cilBrowser,
  cilNoteAdd,
  cilWallpaper,
  cilTextSize,
  cilPeople,
  cilLan,
  cilBarChart
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    // badge: {
    //   color: 'info',
    //   text: 'NEW',
    // },
  },
  {
    component: CNavTitle,
    name: 'Tables',
  },
  {
    component: CNavItem,
    name: 'Languages',
    to: '/lang',
    icon: <CIcon icon={cilLanguage} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Setting',
    to: '/setting',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
  },
  // {
  //   component: CNavItem,
  //   name: 'Banners',
  //   to: '/banner',
  //   icon: <CIcon icon={cilWallpaper} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavItem,
  //   name: 'Blogs',
  //   to: '/blog',
  //   icon: <CIcon icon={cilNewspaper} customClassName="nav-icon" />,
  // },
  {
    component: CNavItem,
    name: 'Services',
    to: '/service',
    icon: <CIcon icon={cilTruck} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Team',
    to: '/team',
    icon: <CIcon icon={cilLan} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Partners',
    to: '/partner',
    icon: <CIcon icon={cilPeople} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Customer',
    to: '/customer',
    icon: <CIcon icon={cilChatBubble} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Our Values',
    to: '/ourValues',
    icon: <CIcon icon={cilDiamond} customClassName="nav-icon" />,
  },
  // {
  //   component: CNavGroup,
  //   name: 'Products',  // for another
  //   // to: '/',
  //   icon: <CIcon icon={cilBasket} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'Product Types',
  //       to: '/productType',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Categories',
  //       to: '/category',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Products',
  //       to: '/product',
  //     }
  //   ]
  // },
  {
    component: CNavGroup,
    name: 'Static',  // for another
    // to: '/',
    icon: <CIcon icon={cilTextSize} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Static Texts',
        to: '/staticText',
      },
      {
        component: CNavItem,
        name: 'Static Images',
        to: '/staticImage',
      },
      {
        component: CNavItem,
        name: 'Custom Text',
        to: '/customText',
      }
    ]
  },
  {
    component: CNavItem,
    name: 'Pages Seo',
    to: '/pagesSeo',
    icon: <CIcon icon={cilBarChart} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Contact Base',
    to: '/contactBase',
    icon: <CIcon icon={cilEnvelopeClosed} customClassName="nav-icon" />,
  },
  // {
  //   component: CNavGroup,
  //   name: 'Contact',
  //   // to: '/',
  //   icon: <CIcon icon={cilEnvelopeClosed} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'Contact Base',
  //       to: '/contactBase',
  //     },
  //     // {
  //     //   component: CNavItem,
  //     //   name: 'How find us',
  //     //   to: '/findUs',
  //     // },
  //   ]
  // },
  // {
  //   component: CNavItem,
  //   name: 'Users',
  //   to: '/user',
  //   icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
  // },




//        L A Z I M S I Z

  // {
  //   component: CNavItem,
  //   name: 'Charts',
  //   to: '/charts',
  //   icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
  // },
  // {
  //   component: CNavGroup,
  //   name: 'Icons',
  //   icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'CoreUI Free',
  //       to: '/icons/coreui-icons',
  //       badge: {
  //         color: 'success',
  //         text: 'NEW',
  //       },
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'CoreUI Flags',
  //       to: '/icons/flags',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'CoreUI Brands',
  //       to: '/icons/brands',
  //     },
  //   ],
  // },
  // {
  //   component: CNavGroup,
  //   name: 'Notifications',
  //   icon: <CIcon icon={cilBell} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'Alerts',
  //       to: '/notifications/alerts',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Badges',
  //       to: '/notifications/badges',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Modal',
  //       to: '/notifications/modals',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Toasts',
  //       to: '/notifications/toasts',
  //     },
  //   ],
  // },
  // {
  //   component: CNavItem,
  //   name: 'Widgets',
  //   to: '/widgets',
  //   icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
  //   badge: {
  //     color: 'info',
  //     text: 'NEW',
  //   },
  // },
  // {
  //   component: CNavTitle,
  //   name: 'Extras',
  // },
  // {
  //   component: CNavGroup,
  //   name: 'Pages',
  //   icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'Login',
  //       to: '/login',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Register',
  //       to: '/register',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Error 404',
  //       to: '/404',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Error 500',
  //       to: '/500',
  //     },
  //   ],
  // },
  // {
  //   component: CNavItem,
  //   name: 'Docs',
  //   href: 'https://coreui.io/react/docs/templates/installation/',
  //   icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  // },
]

export default _nav
