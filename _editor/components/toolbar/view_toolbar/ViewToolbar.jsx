import React, { Component } from 'react';
import i18n from 'i18next';
import { isCanvasElement, isDocument, isPage, isSection, isSlide } from "../../../../common/utils";
import { PanelGroup, Panel } from "react-bootstrap";
import Ediphy from "../../../../core/editor/main";
import { renderAccordion } from "../../../../core/editor/accordion_provider";

export default class ViewToolbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        let id = this.props.containedViewSelected !== 0 ? this.props.containedViewSelected : this.props.navItemSelected;
        let pageObj = this.props.containedViewSelected !== 0 ? this.props.containedViews[this.props.containedViewSelected] : this.props.navItems[this.props.navItemSelected];
        let type = pageObj.type;
        let isContainedView = this.props.containedViewSelected !== 0;
        let doc_type = '';
        if (isPage(id)) {
            doc_type = i18n.t('page');
        }
        if(isSlide(type)) {
            doc_type = i18n.t('slide');
        }

        if(isDocument(type)) {
            doc_type = i18n.t('document');
        }

        if(isSection(id)) {
            doc_type = i18n.t('section');
        }
        let viewToolbar = this.props.viewToolbars[id];
        let controls = {
            main: {
                __name: "Main",
                accordions: { // define accordions for section
                    basic: {
                        __name: "Generales",
                        icon: 'settings',
                        buttons: {
                            navitem_name: {
                                __name: i18n.t('NavItem_name'),
                                type: 'text',
                                value: viewToolbar.viewName,
                                autoManaged: false,
                            },
                        },
                    },
                    header: {
                        __name: i18n.t('Header'),
                        icon: 'format_color_text',
                        buttons: {
                            display_title: {
                                __name: i18n.t('course_title'),
                                type: 'checkbox',
                                checked: viewToolbar.courseTitle && viewToolbar.courseTitle !== 'hidden',
                                autoManaged: false,
                            },
                            display_pagetitle: {
                                __name: i18n.t('Title') + i18n.t('document'),
                                type: 'checkbox',
                                checked: viewToolbar.documentTitle && viewToolbar.documentTitle !== 'hidden',
                                autoManaged: false,

                            },
                            pagetitle_name: {
                                __name: "custom_title",
                                type: 'conditionalText',
                                associatedKey: 'display_pagetitle',
                                autoManaged: false,
                                display: true,
                                value: viewToolbar.documentTitleContent,
                            },
                            display_pagesubtitle: {
                                __name: i18n.t('subtitle'),
                                type: 'checkbox',
                                checked: viewToolbar.documentSubTitle && viewToolbar.documentSubTitle !== 'hidden',
                                autoManaged: false,
                            },
                            pagesubtitle_name: {
                                __name: "custom_subtitle",
                                type: 'conditionalText',
                                associatedKey: 'display_pagesubtitle',
                                autoManaged: false,
                                display: true,
                                value: viewToolbar.documentSubtitleContent,
                            },

                        },

                    },
                    __score: {
                        __name: i18n.t('Score'),
                        icon: 'school',
                        buttons: {
                            weight: {
                                __name: i18n.t('Weight'),
                                type: 'number',
                                min: 0,
                                __defaultField: true,
                                value: this.props.exercises.weight,
                            },
                        },
                    },
                },
            },
        };

        if (!isContainedView && controls && controls.main && controls.main.accordions.header && controls.main.accordions.header.buttons) {
            controls.main.accordions.header.buttons.display_breadcrumb = {
                __name: i18n.t('Breadcrumb'),
                type: 'checkbox',
                checked: viewToolbar.breadcrumb !== 'hidden',
                autoManaged: false,
            };
            controls.main.accordions.header.buttons.display_pagenumber = {
                __name: i18n.t('pagenumber'),
                type: 'checkbox',
                checked: viewToolbar.numPage !== 'hidden',
                autoManaged: false,
            };
            controls.main.accordions.header.buttons.pagenumber_name = {
                __name: "custom_pagenum",
                type: 'conditionalText',
                associatedKey: 'display_pagenumber',
                value: viewToolbar.numPageContent,
                autoManaged: false,
                display: true,
            };
        }
        if (!isContainedView && controls && controls.main && controls.main.accordions.basic && controls.main.accordions.basic.buttons) {
            controls.main.accordions.basic.buttons.page_display = {
                __name: i18n.t('display_page'),
                type: 'checkbox',
                checked: !pageObj.hidden,
                autoManaged: false };
        }

        if (!isCanvasElement(this.props.navItemSelected, Ediphy.Config.sections_have_content)) {
            return (null);
        }
        // when no plugin selected, but new navitem
        let toolbar = this.props.viewToolbars[id];
        return Object.keys(controls).map((tabKey, index) => {
            let tab = controls[tabKey];
            return (
                <div key={'key_' + index} className="toolbarTab">
                    <PanelGroup>
                        {Object.keys(tab.accordions).sort().map((accordionKey, ind) => {
                            return renderAccordion(
                                tab.accordions[accordionKey],
                                tabKey,
                                [accordionKey],
                                toolbar,
                                ind,
                                this.props
                            );
                        })}
                    </PanelGroup>
                </div>
            );
        });
    }

}
