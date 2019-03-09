import * as React from 'react';

export class ActionButton extends React.Component<{ onClick?: any, label?: any, iconSuffix?: string, title?: string, className?: string, groupClassName?: string, disabled?: boolean, dropdown?: any, dropdownCpt?: any, dropdownClass?: any }, {expanded: boolean}> {
    constructor(props: any) {
        super(props);
        this.state = {expanded: false};
    }

    public render() {
        var { onClick, label, iconSuffix, title, disabled, className, dropdown } = this.props;

        if (dropdown) {
            onClick = (e:any) => {
                this.props.onClick && this.props.onClick(e);
                this.setState({ expanded: !this.state.expanded });
            };
        }

        var result = <button title={title} disabled={disabled} className={'btn btn-default ' + (className || "") + (dropdown ? " dropdown-toggle" : "")} onClick={onClick}>
            <i className={'glyphicon ' + (iconSuffix ? ('glyphicon-' + iconSuffix) : "")} /> <span>{label}</span>{!dropdown?null: <span className='caret' />}
        </button>;

        if (dropdown) {
            var DropdownCpt = this.props.dropdownCpt || "div";
            return <div className={'btn-group ' + (this.props.groupClassName || "") }>
                {result}
                <DropdownCpt className={this.props.dropdownClass} style={{ display: this.state.expanded ? "block" : undefined }} >
                    {this.props.children}
                </DropdownCpt>
            </div>;
        }

        return result;
    }
}

