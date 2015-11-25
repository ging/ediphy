import React, {Component} from 'react';
import DaliBox from '../components/DaliBox';

export default class DaliCanvas extends Component{
    render(){
        return(
            <div style={{display: 'table-cell', backgroundColor: 'green', position: 'relative', height: '700px'}}
                 onDrop={ev => {
                    ev.preventDefault();
                    var data = ev.dataTransfer.getData("text");
                    ev.target.appendChild(document.getElementById(data));
                    console.log("ondrop");
                 }}
                 onDragOver={ev => {ev.preventDefault(); console.log("ondragover");}}>
                {this.props.ids.map(id =>{
                    let box = this.props.boxes[id];
                    if(box.slideId === this.props.slide) {
                        let isSelected = (id === this.props.box);
                        return <DaliBox key={id} box={box} id={id}
                                        isSelected={isSelected}
                                        onSelectBox={this.props.onSelectBox}
                                        onMoveBox={this.props.onMoveBox}
                            />
                    }
                })}
            </div>
        );
    }
}