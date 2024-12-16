import { exact } from 'prop-types'
import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

//  Lang
const Lang = React.lazy(() => import('./views/lang/lang'))
const LangInner = React.lazy(() => import('./views/lang/lang-inner'))

//  Banner
const Banner = React.lazy(() => import('./views/banner/banner'))
const BannerInner = React.lazy(() => import('./views/banner/banner-inner'))

const StaticImage = React.lazy(() => import('./views/staticImage/staticImage'))
const StaticImageInner = React.lazy(() => import('./views/staticImage/staticImage-inner'))

const Partner = React.lazy(() => import('./views/partner/partner'))
const PartnerInner = React.lazy(() => import('./views/partner/partner-inner'))

const Setting = React.lazy(() => import('./views/setting/setting'))
const SettingInner = React.lazy(() => import('./views/setting/setting-inner'))

const StaticText = React.lazy(() => import('./views/staticText/staticText'))
const StaticTextCreate = React.lazy(() => import('./views/staticText/staticText-create'))
const StaticTextUpdate = React.lazy(() => import('./views/staticText/staticText-update'))

const OurValue = React.lazy(() => import('./views/ourValues/ourValues'))
const OurValueCreate = React.lazy(() => import('./views/ourValues/ourValues-create'))
const OurValueUpdate = React.lazy(() => import('./views/ourValues/ourValues-update'))

const FindUs = React.lazy(() => import('./views/findUs/findUs'))
const FindUsCreate = React.lazy(() => import('./views/findUs/findUs-create'))
const FindUsUpdate = React.lazy(() => import('./views/findUs/findUs-update'))

const ProductType = React.lazy(() => import('./views/productType/productType'))
const ProductTypeCreate = React.lazy(() => import('./views/productType/productType-create'))
const ProductTypeUpdate = React.lazy(() => import('./views/productType/productType-update'))

const Category = React.lazy(() => import('./views/category/category'))
const CategoryCreate = React.lazy(() => import('./views/category/category-create'))
const CategoryUpdate = React.lazy(() => import('./views/category/category-update'))









// Base
const Accordion = React.lazy(() => import('./views/base/accordion/Accordion'))
const Breadcrumbs = React.lazy(() => import('./views/base/breadcrumbs/Breadcrumbs'))
const Cards = React.lazy(() => import('./views/base/cards/Cards'))
const Carousels = React.lazy(() => import('./views/base/carousels/Carousels'))
const Collapses = React.lazy(() => import('./views/base/collapses/Collapses'))
const ListGroups = React.lazy(() => import('./views/base/list-groups/ListGroups'))
const Navs = React.lazy(() => import('./views/base/navs/Navs'))
const Paginations = React.lazy(() => import('./views/base/paginations/Paginations'))
const Placeholders = React.lazy(() => import('./views/base/placeholders/Placeholders'))
const Popovers = React.lazy(() => import('./views/base/popovers/Popovers'))
const Progress = React.lazy(() => import('./views/base/progress/Progress'))
const Spinners = React.lazy(() => import('./views/base/spinners/Spinners'))
const Tabs = React.lazy(() => import('./views/base/tabs/Tabs'))
const Tables = React.lazy(() => import('./views/base/tables/Tables'))
const Tooltips = React.lazy(() => import('./views/base/tooltips/Tooltips'))

// Buttons
const Buttons = React.lazy(() => import('./views/buttons/buttons/Buttons'))
const ButtonGroups = React.lazy(() => import('./views/buttons/button-groups/ButtonGroups'))
const Dropdowns = React.lazy(() => import('./views/buttons/dropdowns/Dropdowns'))

//Forms
const ChecksRadios = React.lazy(() => import('./views/forms/checks-radios/ChecksRadios'))
const FloatingLabels = React.lazy(() => import('./views/forms/floating-labels/FloatingLabels'))
const FormControl = React.lazy(() => import('./views/forms/form-control/FormControl'))
const InputGroup = React.lazy(() => import('./views/forms/input-group/InputGroup'))
const Layout = React.lazy(() => import('./views/forms/layout/Layout'))
const Range = React.lazy(() => import('./views/forms/range/Range'))
const Select = React.lazy(() => import('./views/forms/select/Select'))
const Validation = React.lazy(() => import('./views/forms/validation/Validation'))

const Charts = React.lazy(() => import('./views/charts/Charts'))

// Icons
const CoreUIIcons = React.lazy(() => import('./views/icons/coreui-icons/CoreUIIcons'))
const Flags = React.lazy(() => import('./views/icons/flags/Flags'))
const Brands = React.lazy(() => import('./views/icons/brands/Brands'))

// Notifications
const Alerts = React.lazy(() => import('./views/notifications/alerts/Alerts'))
const Badges = React.lazy(() => import('./views/notifications/badges/Badges'))
const Modals = React.lazy(() => import('./views/notifications/modals/Modals'))
const Toasts = React.lazy(() => import('./views/notifications/toasts/Toasts'))

const Widgets = React.lazy(() => import('./views/widgets/Widgets'))

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },

  { path: '/lang', name: 'Languages', element: Lang, exact: true},  
  { path: '/lang/:id', name: 'Language', element: LangInner},
  
  { path: '/banner', name: 'Banners', element: Banner, exact: true},  
  { path: '/banner/:id', name: 'Banner', element: BannerInner},
  
  { path: '/staticImage', name: 'Static Images', element: StaticImage, exact: true},  
  { path: '/staticImage/:id', name: 'Static Image', element: StaticImageInner},
  
  { path: '/partner', name: 'Partners', element: Partner, exact: true},  
  { path: '/partner/:id', name: 'Partner', element: PartnerInner},
  
  { path: '/setting', name: 'Settings', element: Setting, exact: true},  
  { path: '/setting/:id', name: 'Setting', element: SettingInner},
  
  { path: '/staticText', name: 'StaticTexts', element: StaticText, exact: true},  
  { path: '/staticText/add', name: 'staticText create', element: StaticTextCreate},   // must be before update
  { path: '/staticText/:id', name: 'staticText', element: StaticTextUpdate},

  { path: '/ourValues', name: 'OurValues', element: OurValue, exact: true},  
  { path: '/ourValues/add', name: 'OurValue create', element: OurValueCreate},   // must be before update
  { path: '/ourValues/:id', name: 'OurValues', element: OurValueUpdate},

  { path: '/findUs', name: 'FindUs', element: FindUs, exact: true},  
  { path: '/findUs/add', name: 'FindUs create', element: FindUsCreate},   // must be before update
  { path: '/findUs/:id', name: 'FindUS', element: FindUsUpdate},

  { path: '/productType', name: 'ProductTypes', element: ProductType, exact: true},  
  { path: '/productType/add', name: 'ProductTypes create', element: ProductTypeCreate},   // must be before update
  { path: '/productType/:id', name: 'ProductTypes', element: ProductTypeUpdate},

  { path: '/category', name: 'Categories', element: Category, exact: true},  
  { path: '/category/add', name: 'Category create', element: CategoryCreate},   // must be before update
  { path: '/category/:id', name: 'Categories', element: CategoryUpdate},














  { path: '/base', name: 'Base', element: Cards, exact: true },
  { path: '/base/accordion', name: 'Accordion', element: Accordion },
  { path: '/base/breadcrumbs', name: 'Breadcrumbs', element: Breadcrumbs },
  { path: '/base/cards', name: 'Cards', element: Cards },
  { path: '/base/carousels', name: 'Carousel', element: Carousels },
  { path: '/base/collapses', name: 'Collapse', element: Collapses },
  { path: '/base/list-groups', name: 'List Groups', element: ListGroups },
  { path: '/base/navs', name: 'Navs', element: Navs },
  { path: '/base/paginations', name: 'Paginations', element: Paginations },
  { path: '/base/placeholders', name: 'Placeholders', element: Placeholders },
  { path: '/base/popovers', name: 'Popovers', element: Popovers },
  { path: '/base/progress', name: 'Progress', element: Progress },
  { path: '/base/spinners', name: 'Spinners', element: Spinners },
  { path: '/base/tabs', name: 'Tabs', element: Tabs },
  { path: '/base/tables', name: 'Tables', element: Tables },
  { path: '/base/tooltips', name: 'Tooltips', element: Tooltips },
  { path: '/buttons', name: 'Buttons', element: Buttons, exact: true },
  { path: '/buttons/buttons', name: 'Buttons', element: Buttons },
  { path: '/buttons/dropdowns', name: 'Dropdowns', element: Dropdowns },
  { path: '/buttons/button-groups', name: 'Button Groups', element: ButtonGroups },
  { path: '/charts', name: 'Charts', element: Charts },
  { path: '/forms', name: 'Forms', element: FormControl, exact: true },
  { path: '/forms/form-control', name: 'Form Control', element: FormControl },
  { path: '/forms/select', name: 'Select', element: Select },
  { path: '/forms/checks-radios', name: 'Checks & Radios', element: ChecksRadios },
  { path: '/forms/range', name: 'Range', element: Range },
  { path: '/forms/input-group', name: 'Input Group', element: InputGroup },
  { path: '/forms/floating-labels', name: 'Floating Labels', element: FloatingLabels },
  { path: '/forms/layout', name: 'Layout', element: Layout },
  { path: '/forms/validation', name: 'Validation', element: Validation },
  { path: '/icons', exact: true, name: 'Icons', element: CoreUIIcons },
  { path: '/icons/coreui-icons', name: 'CoreUI Icons', element: CoreUIIcons },
  { path: '/icons/flags', name: 'Flags', element: Flags },
  { path: '/icons/brands', name: 'Brands', element: Brands },
  { path: '/notifications', name: 'Notifications', element: Alerts, exact: true },
  { path: '/notifications/alerts', name: 'Alerts', element: Alerts },
  { path: '/notifications/badges', name: 'Badges', element: Badges },
  { path: '/notifications/modals', name: 'Modals', element: Modals },
  { path: '/notifications/toasts', name: 'Toasts', element: Toasts },
  { path: '/widgets', name: 'Widgets', element: Widgets },
]

export default routes
