import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import BoxVisor from './BoxVisor';
import {Col} from 'react-bootstrap';
import TitleVisor from './TitleVisor';
import HeaderVisor from './HeaderVisor';
import {aspectRatio} from '../../../common_tools';
import ReactResizeDetector from 'react-resize-detector';

export default class CanvasVisorSli extends Component {

    render() {

        let titles = [];
        if (this.props.navItemSelected.id !== 0) {
            titles.push(this.props.navItemSelected.name);
            let parent = this.props.navItemSelected.parent;
            while (parent !== 0) {
                titles.push(this.props.navItems[parent].name);
                parent = this.props.navItems[parent].parent;
            }
            titles.reverse();
        }

        let maincontent = document.getElementById('maincontent');
        let actualHeight;
        if (maincontent) {
            actualHeight = parseInt(maincontent.scrollHeight, 10);
            actualHeight = (parseInt(maincontent.clientHeight, 10) < actualHeight) ? (actualHeight) + 'px' : '100%';
        }

        let overlayHeight = actualHeight ? actualHeight : '100%';
        //aspectRatio(this.props.aspectRatio);
        return (
            /* jshint ignore:start */

            <Col id="canvas" md={12} xs={12}
                 style={{display:'initial', padding: '0', width: '100%'}}>

                    <div id="airlayer"
                    className={'slide_air'}
                    style={{margin:'0 auto',visibility: (this.props.showCanvas ? 'visible' : 'hidden') }}>

                    <div id="maincontent"
                         onClick={e => {
                        this.setState({showTitle:false})
                       }}
                         className={'innercanvas sli'}
                         style={{visibility: (this.props.showCanvas ? 'visible' : 'hidden')}}>
                        <HeaderVisor titles={titles}
                                     onShowTitle={()=>this.setState({showTitle:true})}
                                     courseTitle={this.props.title}
                                     titleMode={this.props.navItemSelected.titleMode}
                                     navItem={this.props.navItemSelected}
                                     navItems={this.props.navItems}
                                     titleModeToggled={this.props.titleModeToggled}
                                     onUnitNumberChanged={this.props.onUnitNumberChanged}
                                     showButton={true}/>
                        <TitleVisor titles={titles}
                            courseTitle={this.props.title}
                            titleMode={this.props.navItemSelected.titleMode}
                            navItem={this.props.navItemSelected}
                            navItems={this.props.navItems}/>
                        <br/>

                        <div style={{
                                width: "100%",
                                background: "black",
                                height: overlayHeight,
                                position: "absolute",
                                top: 0,
                                opacity: 0.4,
                                display:(this.props.boxLevelSelected > 0) ? "block" : "none",
                                visibility: (this.props.boxLevelSelected > 0) ? "visible" : "collapse"
                            }}></div>

                        {this.props.navItemSelected.boxes.map(id => {
                            let box = this.props.boxes[id];

                            return <BoxVisor key={id}
                                            id={id}
                                            boxes={this.props.boxes}
                                            boxSelected={this.props.boxSelected}
                                            boxLevelSelected={this.props.boxLevelSelected}
                                            changeCurrentView={(element)=>{this.props.changeCurrentView(element)}}
                                            containedViewSelected={this.props.containedViewSelected}
                                            toolbars={this.props.toolbars}
                                            richElementsState={this.props.richElementsState}/>

                        })}


                        <ReactResizeDetector handleWidth handleHeight onResize={(e)=>{aspectRatio(this.props.aspectRatio)}} />
                    </div>
                </div>

            </Col>
            /* jshint ignore:end */
        );
    }
    componentDidUpdate(){
        //aspectRatio(this.props.canvasRatio);
    }
    
    componentDidMount() {
        aspectRatio(this.props.canvasRatio);
       // window.addEventListener("resize", aspectRatio);
    }
    componentWillUnmount() {
       // window.removeEventListener("resize", aspectRatio);
    }

    componentWillUpdate(nextProps){
       if (this.props.canvasRatio !== nextProps.canvasRatio){
            window.canvasRatio = nextProps.canvasRatio;
            //window.removeEventListener("resize", aspectRatio);
            aspectRatio(nextProps.canvasRatio);
            //window.addEventListener("resize", aspectRatio);
        }

    }


}