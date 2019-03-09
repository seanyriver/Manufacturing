import * as React from 'react';

export default class FormatButton extends React.Component<{command?: string, onClick? : any, className? : string, title?: string, selected?: boolean, label?: string}, {}> {
    render() {
        return <button className={'btn btn-default mr-h mb-h ' + (this.props.className || "") + (this.props.selected ? " active" : "")} unselectable
            style={{ userSelect: "none", width: (this.props.label ? "auto" : 36) }}
            title={this.props.title}
            aria-pressed={this.props.selected}
            onMouseDown={(e: any) => { e.preventDefault();}}
            onClick={(e: any) => {
                var { command, onClick } = this.props;
                command && document.execCommand(command);
                onClick && onClick();
            }} >{this.props.children} {this.props.label}</button>;
    }
}

