import React, { Component } from 'react';
import { connect } from 'react-redux';
import { ActionCreators } from 'redux-undo';
import { Grid, Col, Row, Modal } from 'react-bootstrap';
import {
    addNavItem, selectNavItem, expandNavItem, deleteNavItem, reorderNavItem, toggleNavItem, updateNavItemExtraFiles,
    addBox, selectBox, moveBox, resizeBox, updateBox, deleteBox, reorderSortableContainer, dropBox, increaseBoxLevel,
    resizeSortableContainer, deleteSortableContainer, changeCols, changeRows, changeBackground, changeSortableProps,
    reorderBoxes, verticallyAlignBox, selectIndex, duplicateNavItem,
    toggleTextEditor, pasteBox, changeBoxLayer,
    configScore, exportStateAsync, importStateAsync, importState, changeGlobalConfig,
    uploadVishResourceAsync, importEdi,
    deleteContainedView, selectContainedView,
    addRichMark, editRichMark, moveRichMark, deleteRichMark, setCorrectAnswer,
    updateViewToolbar, updatePluginToolbar, updateUI,
    addNavItems, uploadEdiphyResourceAsync, deleteRemoteFileVishAsync, deleteRemoteFileEdiphyAsync,
} from '../../common/actions';
import EditorCanvas from '../components/canvas/editor_canvas/EditorCanvas';
import ContainedCanvas from '../components/rich_plugins/contained_canvas/ContainedCanvas';
import EditorCarousel from '../components/carousel/editor_carousel/EditorCarousel';
import PluginConfigModal from '../components/plugin_config_modal/PluginConfigModal';
import Visor from '../../_visor/containers/Visor';
import PluginRibbon from '../components/nav_bar/plugin_ribbon/PluginRibbon';
import ActionsRibbon from '../components/nav_bar/actions_ribbon/ActionsRibbon';
import EditorNavBar from '../components/nav_bar/editor_nav_bar/EditorNavBar';
import ServerFeedback from '../components/server_feedback/ServerFeedback';
import Toolbar from '../components/toolbar/toolbar/Toolbar';
import RichMarksModal from '../components/rich_plugins/rich_marks_modal/RichMarksModal';
import AutoSave from '../components/autosave/AutoSave';
import Alert from '../components/common/alert/Alert';
import ToggleSwitch from '@trendmicro/react-toggle-switch';
import i18n from 'i18next';
import { parsePluginContainers, parsePluginContainersReact, hasExerciseBox } from '../../common/plugins_inside_plugins';
import Ediphy from '../../core/editor/main';
import printToPDF from '../../core/editor/print';
import {
    isSortableBox, isSection, isContainedView,
    getDescendantLinkedBoxes, isBox,
    getDescendantBoxes, getDescendantBoxesFromContainer,
} from '../../common/utils';
import 'typeface-ubuntu';
import 'typeface-source-sans-pro';
import PropTypes from 'prop-types';
import { ID_PREFIX_BOX } from '../../common/constants';
import { createBox } from '../../common/common_tools';
import FileModal from '../components/external_provider/file_modal/FileModal';
import EdiphyTour from '../components/joyride/EdiphyTour';
import { serialize } from '../../reducers/serializer';
import screen from '../components/joyride/pantalla.svg';
import help from '../components/joyride/help.svg';
import Cookies from 'universal-cookie';
import ExitModal from "../components/exit_modal/ExitModal";
import toMoodleXML from "../../core/editor/moodle_xml.es6";
import { UI } from "../../common/UI.es6";

const cookies = new Cookies();

/**
 * EditorApp. Main application component that renders everything else
 */
class EditorApp extends Component {
    constructor(props) {
        super(props);
        this.index = 0;
        this.severalBoxes = 0;
        this.state = {
            alert: null,
            initModal: cookies.get("ediphy_visitor") === undefined,
        };

        // Bindings

        this.addMarkShortcut = this.addMarkShortcut.bind(this);
        this.deleteMarkCreator = this.deleteMarkCreator.bind(this);
        this.deleteFileFromServer = this.deleteFileFromServer.bind(this);
        this.closeFileModal = this.closeFileModal.bind(this);
        this.onTextEditorToggled = this.onTextEditorToggled.bind(this);
        this.toolbarUpdated = this.toolbarUpdated.bind(this);
        this.keyListener = this.keyListener.bind(this);
        this.beforeUnloadAlert = this.beforeUnloadAlert.bind(this);
        this.duplicateNavItem = this.duplicateNavItem.bind(this);
        this.exportResource = this.exportResource.bind(this);
        this.toggleRichMarksModal = this.toggleRichMarksModal.bind(this);
        this.toggleVisor = this.toggleVisor.bind(this);
        this.onBackgroundChanged = this.onBackgroundChanged.bind(this);
        this.onBoxesInsideSortableReorder = this.onBoxesInsideSortableReorder.bind(this);
        this.onBoxAdded = this.onBoxAdded.bind(this);
        this.onBoxDropped = this.onBoxDropped.bind(this);
        this.onBoxDeleted = this.onBoxDeleted.bind(this);
        this.onBoxSelected = this.onBoxSelected.bind(this);
        this.onBoxLevelIncreased = this.onBoxLevelIncreased.bind(this);
        this.onBoxMoved = this.onBoxMoved.bind(this);
        this.onBoxResized = this.onBoxResized.bind(this);
        this.onIndexSelected = this.onIndexSelected.bind(this);
        this.onColsChanged = this.onColsChanged.bind(this);
        this.onContainedViewNameChanged = this.onContainedViewNameChanged.bind(this);
        this.onContainedViewSelected = this.onContainedViewSelected.bind(this);
        this.onContainedViewDeleted = this.onContainedViewDeleted.bind(this);
        this.onMarkCreatorToggled = this.onMarkCreatorToggled.bind(this);
        this.onNavItemNameChanged = this.onNavItemNameChanged.bind(this);
        this.onNavItemAdded = this.onNavItemAdded.bind(this);
        this.onNavItemsAdded = this.onNavItemsAdded.bind(this);
        this.onNavItemSelected = this.onNavItemSelected.bind(this);
        this.onNavItemExpanded = this.onNavItemExpanded.bind(this);
        this.onNavItemDeleted = this.onNavItemDeleted.bind(this);
        this.onNavItemReordered = this.onNavItemReordered.bind(this);
        this.onNavItemToggled = this.onNavItemToggled.bind(this);
        this.onRichMarkAdded = this.onRichMarkAdded.bind(this);
        this.onRichMarkEditPressed = this.onRichMarkEditPressed.bind(this);
        this.onRichMarkDeleted = this.onRichMarkDeleted.bind(this);
        this.onRichMarkMoved = this.onRichMarkMoved.bind(this);
        this.onRichMarkUpdated = this.onRichMarkUpdated.bind(this);
        this.onRowsChanged = this.onRowsChanged.bind(this);
        this.onScoreConfig = this.onScoreConfig.bind(this);
        this.onSortableContainerDeleted = this.onSortableContainerDeleted.bind(this);
        this.onSortableContainerReordered = this.onSortableContainerReordered.bind(this);
        this.onSortableContainerResized = this.onSortableContainerResized.bind(this);
        this.onSortablePropsChanged = this.onSortablePropsChanged.bind(this);
        this.onTitleChanged = this.onTitleChanged.bind(this);
        this.onVerticallyAlignBox = this.onVerticallyAlignBox.bind(this);
        this.onViewTitleChanged = this.onViewTitleChanged.bind(this);
        this.openFileModal = this.openFileModal.bind(this);
        this.openConfigModal = this.openConfigModal.bind(this);
        this.createHelpModal = this.createHelpModal.bind(this);
        this.createInitModal = this.createInitModal.bind(this);
        this.save = this.save.bind(this);
        this.showTour = this.showTour.bind(this);
        this.setCorrectAnswer = this.setCorrectAnswer.bind(this);
        this.updateViewToolbar = this.updateViewToolbar.bind(this);
        this.uploadFunction = this.uploadFunction.bind(this);

        this.dropListener = (ev) => {
            if (ev.target.tagName === 'INPUT' && ev.target.type === 'file') {
            } else {
                ev.preventDefault();
            }
            dispatch(updateUI(UI.blockDrag, false));
        };
        this.dragListener = (ev) => {
            let { reactUI } = this.props;
            if (!reactUI.showFileUpload && !reactUI.blockDrag) {
                this.props.dispatch(updateUI({
                    showFileUpload: '*',
                    fileModalResult: { id: undefined, value: undefined },
                    fileUploadTab: 0,
                }));
            }
            if (reactUI.showFileUpload && reactUI.fileUploadTab !== 0) {
                this.props.dispatch(updateUI(UI.fileUploadTab, 0));
            }
            ev.preventDefault();
            if (ev.target.parentNode && ev.target.parentNode.classList.contains('fileInput')) {
                ev.target.parentNode.classList.add('dragging');
            }
        };
        this.dragExitListener = (ev) => {
            ev.preventDefault();
            if (ev.target.parentNode && ev.target.parentNode.classList.contains('fileInput')) {
                ev.target.parentNode.classList.remove('dragging');
            }
        };
        this.dragStartListener = (ev) => {
            this.props.dispatch(updateUI(UI.blockDrag, true));
        };
        this.exitListener = (ev) => alert('Please press the Logout button to logout.');
    }

    render() {
        const { dispatch, boxes, boxSelected, boxLevelSelected, navItemsIds, navItems, navItemSelected,
            containedViews, containedViewSelected, filesUploaded, indexSelected, exercises,
            displayMode, isBusy, pluginToolbars, viewToolbars, marks, lastActionDispatched, globalConfig, reactUI, status } = this.props;
        let ribbonHeight = reactUI.hideTab === 'hide' ? 0 : 50;
        let title = globalConfig.title || '---';
        let everPublished = this.props.everPublished;
        let disabled = (navItemSelected === 0 && containedViewSelected === 0) || (!Ediphy.Config.sections_have_content && navItemSelected && isSection(navItemSelected));
        let canGetPlugin = pluginToolbars[boxSelected] && pluginToolbars[boxSelected].config && Ediphy.Plugins.get(pluginToolbars[boxSelected].config.name);
        return (
            <Grid id="app" fluid style={{ height: '100%', overflow: 'hidden' }} ref={'app'}>
                <Row className="navBar">
                    {reactUI.showTour ?
                        <EdiphyTour
                            toggleTour={(showTour)=>dispatch(updateUI(UI.showTour, showTour))}
                            showTour={reactUI.showTour}
                        /> : null}
                    {this.createHelpModal()}
                    {this.createInitModal()}
                    {this.state.alert}
                    <EditorNavBar
                        globalConfig={{ ...globalConfig, status, everPublished }}
                        export={this.exportResource}
                        scorm={(is2004, callback, selfContained = false) => {Ediphy.Visor.exportScorm({ ...this.props.store.getState().undoGroup.present, filesUploaded: this.props.store.getState().filesUploaded, status: this.props.store.getState().status }, is2004, callback, selfContained);}}
                        save={this.save}
                    />
                    {Ediphy.Config.autosave_time > 1000 &&
                    <AutoSave
                        save={this.save}
                        isBusy={isBusy}
                        lastAction={lastActionDispatched}
                        visorVisible={reactUI.visorVisible}/>})
                </Row>
                <Row style={{ height: 'calc(100% - 60px)' }} id="mainRow">
                    <EditorCarousel
                        onBoxAdded={this.onBoxAdded}
                        onContainedViewNameChanged={this.onContainedViewNameChanged}
                        onContainedViewSelected={this.onContainedViewSelected}
                        onContainedViewDeleted={this.onContainedViewDeleted}
                        onIndexSelected={this.onIndexSelected}
                        onNavItemNameChanged={this.onNavItemNameChanged}
                        onNavItemAdded={this.onNavItemAdded}
                        onNavItemSelected={this.onNavItemSelected}
                        onNavItemExpanded={this.onNavItemExpanded}
                        onNavItemDuplicated={this.duplicateNavItem}
                        onNavItemDeleted={this.onNavItemDeleted}
                        onNavItemReordered={this.onNavItemReordered}
                        onTitleChanged={this.onTitleChanged}
                    />

                    <Col id="colRight" xs={12}
                        style={{ height: (this.state.carouselFull ? 0 : '100%'),
                            width: (reactUI.carouselShow ? 'calc(100% - 212px)' : 'calc(100% - 80px)') }}>
                        <Row id="actionsRibbon">
                            <ActionsRibbon
                                onGridToggle={()=> dispatch(updateUI(UI.grid, !reactUI.grid))}
                                grid={reactUI.grid}
                                ribbonHeight={ ribbonHeight + 'px'}/>
                        </Row>

                        <Row id="ribbonRow" style={{ top: '-1px', left: (reactUI.carouselShow ? '15px' : '147px') }}>
                            <PluginRibbon
                                disabled={disabled}
                                onBoxAdded={this.onBoxAdded}
                                ribbonHeight={ ribbonHeight + 'px'} />
                        </Row>
                        <Row id="canvasRow" style={{ height: 'calc(100% - ' + ribbonHeight + 'px)' }}>
                            <EditorCanvas
                                setCorrectAnswer={this.setCorrectAnswer}
                                addMarkShortcut= {this.addMarkShortcut}
                                deleteMarkCreator={this.deleteMarkCreator}
                                lastActionDispatched={lastActionDispatched}
                                moveRichMark={this.onRichMarkMoved}
                                onBoxAdded={this.onBoxAdded}
                                onBoxSelected={this.onBoxSelected}
                                onBoxLevelIncreased={this.onBoxLevelIncreased}
                                onBoxMoved={this.onBoxMoved}
                                onBoxResized={this.onBoxResized}
                                onBoxDropped={this.onBoxDropped}
                                onBoxDeleted={this.onBoxDeleted}
                                onBoxesInsideSortableReorder={this.onBoxesInsideSortableReorder}
                                onContainedViewSelected={this.onContainedViewSelected}
                                onMarkCreatorToggled={this.onMarkCreatorToggled}
                                onSortableContainerDeleted={this.onSortableContainerDeleted}
                                onSortableContainerResized={this.onSortableContainerResized}
                                onSortableContainerReordered={this.onSortableContainerReordered}
                                onVerticallyAlignBox={this.onVerticallyAlignBox}
                                onTextEditorToggled={this.onTextEditorToggled}
                                onRichMarksModalToggled={this.toggleRichMarksModal}
                                onRichMarkMoved={this.onRichMarkMoved}
                                onToolbarUpdated={this.toolbarUpdated}
                                onViewTitleChanged={this.onViewTitleChanged}
                                onTitleChanged={this.onTitleChanged}
                                openConfigModal={this.openConfigModal}
                                openFileModal={this.openFileModal}
                            />
                            <ContainedCanvas
                                onToolbarUpdated={this.toolbarUpdated}
                                setCorrectAnswer={this.setCorrectAnswer}
                                openConfigModal={this.openConfigModal}
                                addMarkShortcut= {this.addMarkShortcut}
                                onBoxAdded={this.onBoxAdded}
                                deleteMarkCreator={this.deleteMarkCreator}
                                onRichMarksModalToggled={this.toggleRichMarksModal}
                                onRichMarkMoved={this.onRichMarkMoved}
                                moveRichMark={this.onRichMarkMoved}
                                lastActionDispatched={lastActionDispatched}
                                onContainedViewSelected={this.onContainedViewSelected}
                                onBoxSelected={this.onBoxSelected}
                                onBoxLevelIncreased={this.onBoxLevelIncreased}
                                onBoxMoved={this.onBoxMoved}
                                onBoxResized={this.onBoxResized}
                                onSortableContainerResized={this.onSortableContainerResized}
                                onSortableContainerDeleted={this.onSortableContainerDeleted}
                                onSortableContainerReordered={this.onSortableContainerReordered}
                                onBoxDropped={this.onBoxDropped}
                                onBoxDeleted={this.onBoxDeleted}
                                onMarkCreatorToggled={this.onMarkCreatorToggled}
                                onVerticallyAlignBox={this.onVerticallyAlignBox}
                                onViewTitleChanged={this.onViewTitleChanged}
                                onTextEditorToggled={this.onTextEditorToggled}
                                onBoxesInsideSortableReorder={this.onBoxesInsideSortableReorder}
                                onTitleChanged={this.onTitleChanged}
                                openFileModal={this.openFileModal}
                            />
                        </Row>
                    </Col>
                </Row>
                <ServerFeedback
                    show={reactUI.serverModal}
                    // !!!
                    title={"Guardar cambios"}
                    isBusy={isBusy}
                    hideModal={()=>{dispatch(updateUI('serverModal', false));}}/>
                <Visor
                    id="visor"
                    title={title}
                    visorVisible={reactUI.visorVisible}
                    onVisibilityToggled={()=> dispatch(updateUI('visorVisible', !reactUI.visorVisible))}
                    filesUploaded={this.props.store.getState().filesUploaded }
                    state={{
                        ...this.props.store.getState().undoGroup.present,
                        filesUploaded: this.props.store.getState().filesUploaded,
                        status: this.props.store.getState().status }}
                />
                <PluginConfigModal
                    id={reactUI.pluginConfigModal}
                    fileModalResult={reactUI.fileModalResult}
                    openFileModal={this.openFileModal}
                    name={pluginToolbars[reactUI.pluginConfigModal] ? pluginToolbars[reactUI.pluginConfigModal].pluginId : ""}
                    state={pluginToolbars[reactUI.pluginConfigModal] ? pluginToolbars[reactUI.pluginConfigModal].state : {}}
                    closeConfigModal={()=> dispatch(updateUI(UI.pluginConfigModal, false))}
                    updatePluginToolbar={(id, state) => dispatch(updateBox(id, "", pluginToolbars[reactUI.pluginConfigModal], state))}
                />
                {Ediphy.Config.external_providers.enable_catalog_modal &&
                <ExternalCatalogModal
                    images={filesUploaded}
                    visible={reactUI.catalogModal}
                    onExternalCatalogToggled={() => dispatch(updateUI(UI.catalogModal, !reactUI.catalogModal))}
                />}
                <RichMarksModal
                    defaultValueMark={ canGetPlugin ?
                        Ediphy.Plugins.get(pluginToolbars[boxSelected].config.name).getConfig().defaultMarkValue
                        : 0 }
                    validateValueInput={ canGetPlugin ?
                        Ediphy.Plugins.get(pluginToolbars[boxSelected].config.name).validateValueInput
                        : null}
                    onBoxAdded={this.onBoxAdded}
                    onRichMarkAdded={this.onRichMarkAdded}
                    onRichMarkUpdated={this.onRichMarkUpdated}
                    onRichMarksModalToggled={this.toggleRichMarksModal}
                />
                <Toolbar
                    top={(60 + ribbonHeight) + 'px'}
                    openConfigModal={this.openConfigModal}
                    onContainedViewNameChanged={this.onContainedViewNameChanged}
                    onBackgroundChanged={this.onBackgroundChanged}
                    onNavItemToggled={this.onNavItemToggled}
                    onNavItemSelected={this.onNavItemSelected}
                    onContainedViewSelected={this.onContainedViewSelected}
                    onColsChanged={this.onColsChanged}
                    onRowsChanged={this.onRowsChanged}
                    onBoxResized={this.onBoxResized}
                    onBoxMoved={this.onBoxMoved}
                    onVerticallyAlignBox={this.onVerticallyAlignBox}
                    onTextEditorToggled={this.onTextEditorToggled}
                    onSortableContainerResized={this.onSortableContainerResized}
                    onSortableContainerDeleted={this.onSortableContainerDeleted}
                    onSortablePropsChanged={this.onSortablePropsChanged}
                    onToolbarUpdated={this.toolbarUpdated}
                    onScoreConfig={this.onScoreConfig}
                    onBoxDeleted={this.onBoxDeleted}
                    onRichMarksModalToggled={this.toggleRichMarksModal}
                    onRichMarkEditPressed={this.onRichMarkEditPressed}
                    onRichMarkDeleted={this.onRichMarkDeleted}
                    openFileModal={this.openFileModal}
                    updateViewToolbar={this.updateViewToolbar}
                />
                <FileModal
                    disabled={disabled}
                    onBoxAdded={this.onBoxAdded}
                    importEdi={(state) => dispatch(serialize(importEdi(state)))}
                    onNavItemSelected={this.onNavItemSelected}
                    deleteFileFromServer={this.deleteFileFromServer}
                    onIndexSelected={this.onIndexSelected}
                    fileUploadTab={reactUI.fileUploadTab}
                    onNavItemAdded={this.onNavItemAdded}
                    onNavItemsAdded={this.onNavItemsAdded}
                    uploadFunction={this.uploadFunction}
                    close={this.closeFileModal}
                />
            </Grid>
        );
    }

    /* Help Modal */
    createHelpModal() {
        let closeModal = () => this.props.dispatch(updateUI(UI.showHelpButton, false));
        return <Modal className="pageModal welcomeModal helpModal"
            show={this.props.reactUI.showHelpButton}
            cancelButton
            acceptButtonText={i18n.t("joyride.start")}
            onHide={closeModal}>
            <Modal.Header closeButton>
                <Modal.Title>{i18n.t("messages.help")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div style={{ width: '100%' }}>
                    <h2>{i18n.t('messages.help_modal_text')}</h2>
                    <img src={help} alt="" style={{ width: '100%' }}/>
                </div>
                <div className={"help_options"}>
                    <button onClick={()=>{this.showTour();}} className={"help_item"}>Paseo de bienvenida a EDiphy</button>
                    <a href="http://ging.github.io/ediphy/#/manual" target="_blank"><div className={"help_item"}>
                        Si después del paseo inicial te ha quedado alguna duda, consulta nuestro manual de usuario
                    </div></a>
                    <a href="http://ging.github.io/ediphy/#/docs" target="_blank"><div className={"help_item"}>
                        Si eres desarrollador, echa un ojo a la documentación
                    </div></a>
                </div>
            </Modal.Body>

        </Modal>;
    }

    showTour() {
        this.props.dispatch(updateUI(UI.showTour, true));
        this.props.dispatch(updateUI(UI.showHelpButton, false));
    }

    exportResource(format, callback, options) {
        if(format === "PDF") {
            printToPDF(this.props.store.getState().undoGroup.present, callback, options);
        } else if (format === "MoodleXML") {
            toMoodleXML(this.props.store.getState().undoGroup.present, callback, options);
        } else if (format === "edi") {
            Ediphy.Visor.exportsEDI({ ...this.props.store.getState().undoGroup.present, filesUploaded: this.props.store.getState().filesUploaded }, callback);
        } else {
            Ediphy.Visor.exportsHTML({ ...this.props.store.getState().undoGroup.present, filesUploaded: this.props.store.getState().filesUploaded }, callback, options);
        }
    }

    toggleRichMarksModal(value, boxId = -1) {
        const reactUI = this.props.reactUI;
        this.props.dispatch(updateUI(UI.richMarksVisible, !reactUI.richMarksVisible));
        this.props.dispatch(updateUI(UI.markCursorValue, value));
        if(reactUI.richMarksVisible) {
            this.props.dispatch(updateUI({
                currentRichMark: null,
                markCursorValue: null,
            }));
        }
        this.props.dispatch(selectBox(boxId, this.props.boxes[boxId]));
    }

    createInitModal() {
        return <Alert className="pageModal welcomeModal"
            show={this.state.initModal}
            hasHeader={false}
            title={<span><i style={{ fontSize: '14px', marginRight: '5px' }} className="material-icons">delete</i>{i18n.t("messages.confirm_delete_cv")}</span>}
            cancelButton
            acceptButtonText={i18n.t("joyride.start")}
            onClose={(bool)=>{
                bool && this.props.dispatch(updateUI('showTour', true));
                this.setState({ initModal: false });
            }}>
            <div className="welcomeModalDiv">
                <img src={screen} alt="" style={{ width: '100%' }}/>
                <h1>{i18n.t('joyride.welcome')}<strong style={{ color: '#17CFC8' }}>Ediphy</strong>!</h1>
                <p>{i18n.t('joyride.ediphy_description')}</p>
                <p><strong>{i18n.t('joyride.need_help')}</strong></p>
            </div>
        </Alert>;
    }
    /**
     * After component mounts
     * Loads plugin API and sets listeners for plugin events, marks and keyboard keys pressed
     */
    componentDidMount() {
        if (process.env.NODE_ENV === 'production' && process.env.DOC !== 'doc' && ediphy_editor_json && ediphy_editor_json !== 'undefined') {
            this.props.dispatch(importState(serialize(JSON.parse(ediphy_editor_json))));

        }
        if (process.env.NODE_ENV === 'production' && process.env.DOC === 'doc') {
            window.oncontextmenu = function() {
                return false;
            };
        }
        document.addEventListener('keydown', this.keyListener);
        document.addEventListener('dragover', this.dragListener);
        document.addEventListener('dragleave', this.dragExitListener);
        document.addEventListener('drop', this.dropListener);
        document.addEventListener('dragstart', this.dragStartListener);

        if(cookies.get("ediphy_visitor") === undefined) {
            cookies.set("ediphy_visitor", true);
        }

    }
    componentWillUnmount() {
        document.removeEventListener('keydown', this.keyListener);
        document.removeEventListener('dragover', this.dragListener);
        document.removeEventListener('dragleave', this.dragExitListener);
        document.removeEventListener('drop', this.dropListener);
        document.removeEventListener('dragstart', this.dragStartListener);
    }

    beforeUnloadAlert() {
        if(!this.props.reactUI.publishing) {
            return i18n.t('messages.exit_page');
        }
        return undefined;
    }

    closeFileModal(fileModalResult) {
        this.props.dispatch((updateUI({
            showFileUpload: false,
            fileUploadTab: 0,
            fileModalResult: fileModalResult ? fileModalResult : { id: undefined, value: undefined },
        })));
    }

    deleteMarkCreator() {
        this.props.dispatch(updateUI(UI.markCreatorVisible, false));
    }

    deleteFileFromServer(id, url, callback) {
        let inProduction = (process.env.NODE_ENV === 'production' && process.env.DOC !== 'doc');
        let deleteFunction = inProduction ? deleteRemoteFileVishAsync : deleteRemoteFileEdiphyAsync;
        this.props.dispatch(deleteFunction(id, url, callback));
    }

    keyListener(e) {
        let key = e.keyCode ? e.keyCode : e.which;
        if (key === 9) {
            e.preventDefault();
            return;
        }
        // Checks what element has the cursor focus currently
        let focus = document.activeElement.className;
        let notText = (!document.activeElement.type || focus.indexOf('rib') !== -1) && focus.indexOf('form-control') === -1 && focus.indexOf('tituloCurso') === -1 && focus.indexOf('cke_editable') === -1;

        // Ctrl + Z
        if (key === 90 && e.ctrlKey) {
            if (notText) {
                this.props.dispatch(ActionCreators.undo());
            }
        }
        // Ctrl + Y
        if (key === 89 && e.ctrlKey) {
            if (notText) {
                this.props.dispatch(ActionCreators.redo());
            }
        }
        // Ctrl + A
        if (key === 192 && e.ctrlKey) {
            this.duplicateNavItem(this.props.navItemSelected);
        }

        if (key === 80 && e.ctrlKey && e.shiftKey) {
            e.cancelBubble = true;
            e.preventDefault();

            e.stopImmediatePropagation();
            printToPDF(this.props.store.getState().undoGroup.present, (b)=>{if(b) {alert('Error');}});
        }

        // Supr
        else if (key === 46 || key === 8) {
            if (this.props.boxSelected !== -1 && !isSortableBox(this.props.boxSelected)) {
            // If it is not an input or any other kind of text edition AND there is a box selected, it deletes said box
                if (notText) {
                    let box = this.props.boxes[this.props.boxSelected];
                    let toolbar = this.props.pluginToolbars[this.props.boxSelected];
                    if (!toolbar.showTextEditor) {
                        this.onBoxDeleted(box.id, box.parent, box.container, this.props.containedViewSelected && this.props.containedViewSelected !== 0 ? this.props.containedViewSelected : this.props.navItemSelected);
                    }
                }
            }
        }

        if (key === 112) {
            e.preventDefault();
            this.props.dispatch(updateUI(UI.showHelpButton, true));
        }
        if (key === 113) {
            e.preventDefault();
            this.props.dispatch(updateUI(UI.visorVisible, true));
        }
    }

    addMarkShortcut(mark) {
        let state = JSON.parse(JSON.stringify(this.props.pluginToolbars[this.props.boxSelected].state));
        state.__marks[mark.id] = JSON.parse(JSON.stringify(mark));
        if(mark.connection.id) {
            state.__marks[mark.id].connection = mark.connection.id;
        }
        this.props.dispatch(addRichMark(this.props.boxSelected, mark, state));
    }

    onBackgroundChanged(id, background) {
        this.props.dispatch(changeBackground(id, background));
    }

    onBoxesInsideSortableReorder(parent, container, order) {
        this.props.dispatch(reorderBoxes(parent, container, order));
    }

    onBoxDeleted(id, parent, container, page) {
        let bx = getDescendantBoxes(this.props.boxes[id], this.props.boxes);
        let cvs = [...this.props.boxes[id].containedViews];
        bx.map(box=>{
            cvs = [...cvs, ...this.props.boxes[box].containedViews];
        });
        this.props.dispatch(deleteBox(id,
            parent,
            container,
            bx,
            cvs,
            page));
    }

    onBoxAdded(ids, draggable, resizable, content, style, state, structure, initialParams) {
        this.props.dispatch(addBox(ids, draggable, resizable, content, style, state, structure, initialParams));
    }

    onBoxSelected(id) {
        this.props.dispatch(selectBox(id, this.props.boxes[id]));
    }

    onBoxLevelIncreased() {
        this.props.dispatch(increaseBoxLevel());
    }

    onBoxMoved(id, x, y, position, parent, container) {
        this.props.dispatch(moveBox(id, x, y, position, parent, container));
    }

    onBoxResized(id, structure) {
        this.props.dispatch(resizeBox(id, structure));
    }

    onBoxDropped(id, row, col, parent, container, oldParent, oldContainer, position, index) {
        this.props.dispatch(dropBox(id, row, col, parent, container, oldParent, oldContainer, position, index));
    }

    onIndexSelected(id) {
        this.props.dispatch(selectIndex(id));
    }

    onColsChanged(id, parent, distribution, boxesAffected) {
        this.props.dispatch(changeCols(id, parent, distribution, boxesAffected));
    }

    onContainedViewNameChanged(id, titleStr) {
        this.props.dispatch(updateViewToolbar(id, titleStr));
    }

    onContainedViewSelected(id) {
        this.props.dispatch(selectContainedView(id));
    }

    onContainedViewDeleted(cvid) {
        let boxesRemoving = [];
        this.props.containedViews[cvid].boxes.map(boxId => {
            boxesRemoving.push(boxId);
            boxesRemoving = boxesRemoving.concat(getDescendantBoxes(this.props.boxes[boxId], this.props.boxes));
        });
        this.props.dispatch(deleteContainedView([cvid], boxesRemoving, this.props.containedViews[cvid].parent));
    }

    onMarkCreatorToggled(id) {
        this.props.dispatch(updateUI(UI.markCreatorVisible, id));
    }

    onNavItemNameChanged(id, titleStr) {
        this.props.dispatch(updateViewToolbar(id, titleStr));
    }

    onNavItemAdded(id, name, parent, type, position, background, customSize, hideTitles, hasContent, sortable_id) {
        this.props.dispatch(addNavItem(
            id,
            name,
            parent,
            type,
            position,
            background,
            customSize,
            hideTitles,
            (type !== 'section' || (type === 'section' && Ediphy.Config.sections_have_content)),
            sortable_id));
    }

    onNavItemsAdded(navs, parent) {
        this.props.dispatch(addNavItems(navs, parent));
    }

    onNavItemSelected(id) {
        this.props.dispatch(selectNavItem(id));
    }

    onNavItemExpanded(id, value) {
        this.props.dispatch(expandNavItem(id, value));
    }

    onNavItemDeleted(navsel) {
        let viewRemoving = [navsel].concat(this.getDescendantViews(this.props.navItems[navsel]));
        let boxesRemoving = [];
        let containedRemoving = {};
        viewRemoving.map(id => {
            this.props.navItems[id].boxes.map(boxId => {
                boxesRemoving.push(boxId);
                boxesRemoving = boxesRemoving.concat(getDescendantBoxes(this.props.boxes[boxId], this.props.boxes));
            });
        });
        let marksRemoving = getDescendantLinkedBoxes(viewRemoving, this.props.navItems) || [];
        dispatch(deleteNavItem(
            viewRemoving,
            this.props.navItems[navsel].parent,
            boxesRemoving,
            containedRemoving,
            marksRemoving));
    }

    onNavItemReordered(id, newParent, oldParent, idsInOrder, childrenInOrder) {
        this.props.dispatch(reorderNavItem(id, newParent, oldParent, idsInOrder, childrenInOrder));
    }

    onNavItemToggled() {
        this.props.dispatch(toggleNavItem(navItemSelected));
    }

    onRichMarkAdded(mark, view, viewToolbar) {
        this.props.dispatch(addRichMark(mark, view, viewToolbar));
    }

    onRichMarkMoved(mark, value) {
        this.props.dispatch(moveRichMark(mark, value));
    }

    onRichMarkDeleted(id) {
        let cvid = this.props.marks[id].connection;
        // This checks if the deleted mark leaves an orphan contained view, and displays a message asking if the user would like to delete it as well
        if (isContainedView(cvid)) {
            let thiscv = this.props.containedViews[cvid];
            if (Object.keys(thiscv.parent).length === 1) {
                let confirmText = i18n.t("messages.confirm_delete_CV_also_1") + this.props.viewToolbars[cvid].viewName + i18n.t("messages.confirm_delete_CV_also_2");
                let alertComponent = (<Alert className="pageModal"
                    show
                    hasHeader
                    title={<span><i style={{ fontSize: '14px', marginRight: '5px' }} className="material-icons">delete</i>{i18n.t("messages.confirm_delete_cv")}</span>}
                    cancelButton
                    acceptButtonText={i18n.t("messages.OK")}
                    onClose={(bool)=>{
                        if (bool) {
                            this.props.dispatch(deleteRichMark(this.props.marks[id]));
                            let deleteAlsoCV = document.getElementById('deleteAlsoCv').classList.toString().indexOf('checked') > 0;
                            if(deleteAlsoCV) {
                                let boxesRemoving = [];
                                this.props.containedViews[cvid].boxes.map(boxId => {
                                    boxesRemoving.push(boxId);
                                    boxesRemoving = boxesRemoving.concat(getDescendantBoxes(this.props.boxes[boxId], this.props.boxes));
                                });

                                this.props.dispatch(deleteContainedView([cvid], boxesRemoving, thiscv.parent));
                            }
                        } else {

                        }
                        this.setState({ alert: null });}}>
                    <span> {confirmText} </span><br/>
                    <ToggleSwitch id="deleteAlsoCv" style={{ margin: '10px' }}/>
                    {i18n.t("messages.confirm_delete_cv_as_well")}
                </Alert>);
                this.setState({ alert: alertComponent });
                return;
            }
        }
        this.props.dispatch(deleteRichMark(marks[id]));
    }

    onRichMarkEditPressed(mark) {
        this.props.dispatch(updateUI(UI.currentRichMark, mark));
    }

    onRowsChanged(id, parent, column, distribution, boxesAffected) {
        this.props.dispatch(changeRows(id, parent, column, distribution, boxesAffected));
    }

    onSortableContainerResized(id, parent, height) {
        this.props.dispatch(resizeSortableContainer(id, parent, height));
    }

    onSortableContainerReordered(ids, parent) {
        this.props.dispatch(reorderSortableContainer(ids, parent));
    }

    onTitleChanged(id = 'title', titleStr) {
        this.props.dispatch(changeGlobalConfig(id, titleStr));
    }

    onVerticallyAlignBox(id, verticalAlign) {
        this.props.dispatch(verticallyAlignBox(id, verticalAlign));
    }

    openFileModal(id = undefined, accept) {
        this.props.dispatch((updateUI({
            showFileUpload: accept,
            fileUploadTab: 1,
            fileModalResult: { id, value: undefined },
        })));
    }

    duplicateNavItem(id) {
        if (id && this.props.navItems[id]) {
            let newBoxes = [];
            let navItem = this.props.navItems[id];
            let linkedCVs = {};
            if (navItem.boxes) {
                newBoxes = newBoxes.concat(navItem.boxes);
                navItem.boxes.forEach(b => {
                    let box = this.props.boxes[b];
                    if (box.sortableContainers) {
                        for (let sc in box.sortableContainers) {
                            if (box.sortableContainers[sc].children) {
                                newBoxes = newBoxes.concat(box.sortableContainers[sc].children);
                                box.sortableContainers[sc].children.forEach(bo => {
                                    let bx = this.props.boxes[bo];
                                    if (bx.sortableContainers) {
                                        for (let scc in bx.sortableContainers) {
                                            if (bx.sortableContainers[scc].children) {
                                                newBoxes = newBoxes.concat(bx.sortableContainers[scc].children);

                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                });
            }
            let newBoxesMap = {};
            newBoxes.map(box => {
                linkedCVs[box] = [...this.props.boxes[box].containedViews];
                newBoxesMap[box] = box + Date.now(); });

            this.props.dispatch(duplicateNavItem(id, id + Date.now(), newBoxesMap, Date.now(), linkedCVs));
        }
    }

    toggleVisor() {
        this.props.dispatch(updateUI('visorVisible', !this.props.reactUI.visorVisible));
    }

    toolbarUpdated(id, tab, accordion, name, value) {
        if (isBox(id) || isSortableBox(id)) {
            let toolbar = this.props.pluginToolbars[id];
            let pluginAPI = Ediphy.Plugins.get(toolbar.pluginId);
            let config = pluginAPI.getConfig();
            let deletedBoxes = [];
            if (config.isComplex && accordion === 'state') {
                let newPluginState = JSON.parse(JSON.stringify(toolbar.state));
                newPluginState[name] = value;
                let pluginContainerIds = {};// newPluginState.__pluginContainerIds;
                let defaultBoxes = {};
                if (config.flavor !== "react") {
                    let content = pluginAPI.getRenderTemplate(newPluginState);
                    parsePluginContainers(content, pluginContainerIds);
                } else {
                    let content = pluginAPI.getRenderTemplate(newPluginState, { exercises: { correctAnswer: true } });
                    parsePluginContainersReact(content, pluginContainerIds, defaultBoxes);
                }
                if (toolbar.state.__pluginContainerIds && (Object.keys(toolbar.state.__pluginContainerIds).length < Object.keys(pluginContainerIds).length)) {
                    for (let s in pluginContainerIds) {
                        if (!toolbar.state.__pluginContainerIds[s]) {
                            if (defaultBoxes[s]) {
                                let page = this.props.containedViewSelected && this.props.containedViewSelected !== 0 ? this.props.containedViewSelected : this.props.navItemSelected;
                                this.props.dispatch(updatePluginToolbar(id, tab, accordion,
                                    [name, "__pluginContainerIds"],
                                    [value, pluginContainerIds]));
                                defaultBoxes[s].map((newBox, ind) => {
                                    createBox({
                                        parent: id,
                                        page,
                                        container: s,
                                        isDefaultPlugin: true,
                                        initialState: newBox.initialState,
                                        id: ID_PREFIX_BOX + Date.now() + '_' + ind,
                                        draggable: true,
                                        resizable: this.props.boxes[id].resizable,
                                    }, newBox.type, false,
                                    (ids, draggable, resizable, content, style, state, structure, initialParams)=>{this.props.dispatch(addBox(ids, draggable, resizable, content, style, state, structure, initialParams));},
                                    this.props.boxes);
                                });

                            }
                        }
                    }
                    return;
                } else if (toolbar.state.__pluginContainerIds && (Object.keys(toolbar.state.__pluginContainerIds).length > Object.keys(pluginContainerIds).length)) {
                    for (let s in toolbar.state.__pluginContainerIds) {
                        if (!pluginContainerIds[s]) {
                            if (this.props.boxes[id].sortableContainers[s].children) {
                                deletedBoxes = deletedBoxes.concat(this.props.boxes[id].sortableContainers[s].children);
                            }
                        }
                    }
                }
                this.props.dispatch(updatePluginToolbar(id, tab, accordion,
                    [name, "__pluginContainerIds"],
                    [value, pluginContainerIds], deletedBoxes));
                return;
            }
            this.props.dispatch(updatePluginToolbar(id, tab, accordion, name, value, deletedBoxes));
        } else {
            this.props.dispatch(updateViewToolbar(id, tab, accordion, name, value));
        }
    }

    onRichMarkUpdated(mark, createNew) {
        let boxSelected = this.props.boxSelected;
        let mark_exist = this.props.marks[mark.id] !== undefined;
        if (mark_exist) {

        }

        let oldConnection = state.__marks[mark.id] ? state.__marks[mark.id].connection : 0;
        state.__marks[mark.id] = JSON.parse(JSON.stringify(mark));
        let newConnection = mark.connection;
        if (mark.connection.id) {
            newConnection = mark.connection.id;
            state.__marks[mark.id].connection = mark.connection.id;
        }

        this.props.dispatch(editRichMark(boxSelected, state, mark, oldConnection, newConnection));

    }

    onScoreConfig(id, button, value, page) {
        this.props.dispatch(configScore(id, button, value, page));
    }

    onSortableContainerDeleted(id, parent) {
        let boxes = this.props.boxes;
        let containedViews = this.props.containedViews;
        let page = this.props.containedViewSelected && this.props.containedViewSelected !== 0 ? this.props.containedViewSelected : this.props.navItemSelected;
        let descBoxes = getDescendantBoxesFromContainer(boxes[parent], id, this.props.boxes, this.props.containedViews);
        let cvs = {};
        for (let b in descBoxes) {
            let box = boxes[descBoxes[b]];
            for (let cv in box.containedViews) {
                if (!cvs[box.containedViews[cv]]) {
                    cvs[box.containedViews[cv]] = [box.id];
                } else if (cvs[containedViews[cv]].indexOf(box.id) === -1) {
                    cvs[box.containedViews[cv]].push(box.id);
                }
            }
        }
        this.props.dispatch(deleteSortableContainer(id, parent, descBoxes, cvs, page));
    }

    onSortablePropsChanged(id, parent, prop, value) {
        this.props.dispatch(changeSortableProps(id, parent, prop, value));
    }

    onTextEditorToggled(caller, value, text, content) {
        let pluginToolbar = this.props.pluginToolbars[caller];
        if(pluginToolbar && pluginToolbar.pluginId !== "sortable_container") {
            let state = Object.assign({}, pluginToolbar.state, { __text: text });
            let toolbar = Ediphy.Plugins.get(pluginToolbar.pluginId).getToolbar(state);

            this.props.dispatch(toggleTextEditor(caller, value));
            if (!value && text && content) {
                this.props.dispatch(updateBox(caller, content, toolbar, state));
            }
        }

    }

    onViewTitleChanged(id, titles) {
        this.props.dispatch(updateViewToolbar(id, titles));
    }

    openConfigModal(id) {
        this.props.dispatch(updateUI(UI.pluginConfigModal, id));
    }

    save(win) {
        this.props.dispatch(exportStateAsync({ ...this.props.store.getState() }, win));
    }

    setCorrectAnswer(id, correctAnswer, page) {
        this.props.dispatch(setCorrectAnswer(id, correctAnswer, page));
    }

    updateViewToolbar(id, toolbar) {
        this.props.dispatch(updateViewToolbar(id, toolbar));
    }

    uploadFunction(query, keywords, callback) {
        let inProduction = (process.env.NODE_ENV === 'production' && process.env.DOC !== 'doc');
        let uploadFunction = inProduction ? uploadVishResourceAsync : uploadEdiphyResourceAsync;
        this.props.dispatch(uploadFunction(query, keywords, callback));
    }

}

function mapStateToProps(state) {
    return {
        reactUI: state.reactUI,
        version: state.undoGroup.present.version,
        status: state.status,
        everPublished: state.everPublished,
        globalConfig: state.undoGroup.present.globalConfig,
        filesUploaded: state.filesUploaded,
        boxes: state.undoGroup.present.boxesById,
        boxSelected: state.undoGroup.present.boxSelected,
        boxLevelSelected: state.undoGroup.present.boxLevelSelected,
        indexSelected: state.undoGroup.present.indexSelected,
        navItemsIds: state.undoGroup.present.navItemsIds,
        navItems: state.undoGroup.present.navItemsById,
        navItemSelected: state.undoGroup.present.navItemSelected,
        containedViews: state.undoGroup.present.containedViewsById,
        containedViewSelected: state.undoGroup.present.containedViewSelected,
        undoDisabled: state.undoGroup.past.length === 0,
        redoDisabled: state.undoGroup.future.length === 0,
        displayMode: state.undoGroup.present.displayMode,
        marks: state.undoGroup.present.marksById,
        pluginToolbars: state.undoGroup.present.pluginToolbarsById,
        viewToolbars: state.undoGroup.present.viewToolbarsById,
        exercises: state.undoGroup.present.exercises,
        isBusy: state.undoGroup.present.isBusy,
        lastActionDispatched: state.undoGroup.present.lastActionDispatched || "",

    };
}

export default connect(mapStateToProps)(EditorApp);

EditorApp.propTypes = {
    globalConfig: PropTypes.object.isRequired,
    filesUploaded: PropTypes.any,
    boxes: PropTypes.object.isRequired,
    boxSelected: PropTypes.any,
    boxLevelSelected: PropTypes.any,
    indexSelected: PropTypes.any,
    marks: PropTypes.object,
    navItemsIds: PropTypes.array.isRequired,
    navItems: PropTypes.object.isRequired,
    navItemSelected: PropTypes.any,
    containedViews: PropTypes.object.isRequired,
    containedViewSelected: PropTypes.any,
    pluginToolbars: PropTypes.object,
    displayMode: PropTypes.string,
    viewToolbars: PropTypes.object.isRequired,
    exercises: PropTypes.object,
    isBusy: PropTypes.any,
    dispatch: PropTypes.func.isRequired,
    store: PropTypes.any,
    lastActionDispatched: PropTypes.string,
    status: PropTypes.string,
    everPublished: PropTypes.bool,
};
