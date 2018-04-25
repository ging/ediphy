import React from "react";
import { Button, Col, Grid, Row } from "react-bootstrap";
import i18n from 'i18next';
import TableComponent from './table-component';
import DataProvider from './data-provider';
import ChartOptions from './chart-options';
/* eslint-disable react/prop-types */

export default class Config extends React.Component {
    render() {
        let { data, options, keys, editing } = this.props.state;
        return (
            <Grid>
                <Row>

                    <Col lg={12} xs={12}>
                        <h4> {i18n.t("DataTable.header.origin")} </h4>
                        {!editing &&
                        <Button onClick={this.editButtonClicked} style={{ marginTop: '0px' }} className="btn-primary">{i18n.t("DataTable.edit")} </Button>
                        }
                        {editing &&
                        <DataProvider id={this.props.id} data={data} dataChanged={this.dataChanged} keys={keys} props={this.props.props}/>
                        }
                        {!editing &&
                        <ChartOptions options={options} optionsChanged={this.optionsChanged} keys={keys} />
                        }
                    </Col>
                    <Col lg={12} xs={12} ><br/>
                        {!editing && <div>
                            <h4>{i18n.t("DataTable.header.preview")}</h4><br/>
                            <div style={{ marginRight: '-10px', marginLeft: '0px' }} ref="chartContainer" id="chartContainer">
                                <TableComponent data={data} keys={keys} options={options} key={Math.random()}/>
                            </div>
                        </div>}
                        {!editing && <div id="previewOverlay"/>}
                    </Col>

                </Row>

            </Grid>

        );
    }
    constructor(props) {
        super(props);
        this.dataChanged = this.dataChanged.bind(this);
        this.setOptions = this.setOptions.bind(this);
        this.optionsChanged = this.optionsChanged.bind(this);
        this.editButtonClicked = this.editButtonClicked.bind(this);
    }

    dataChanged(values) {
        let { data, keys, options } = this.setOptions(values.data, values.keys);
        this.props.updateState({ ...this.props.state, data, keys, options, editing: false });
    }

    setOptions(data, keys) {
        let options = this.props.state.options;
        return { data, keys, options };
    }

    optionsChanged(newOptions) {
        let options = { ...this.props.state.options, ...newOptions, key: Math.random() };
        this.props.updateState({ ...this.props.state, options });
    }

    editButtonClicked() {
        this.props.updateState({ ...this.props.state, editing: true });
    }

}

/* eslint-enable react/prop-types */
