import * as React from 'react';

type Props = {
    sections: string[],
    selected?: string,
    onSelect: (section: string) => any,
    className?: string,
};

type State = {
    searchTimeout: any
};

export default class SectionBar extends React.Component<Props,State> {
    constructor(props:any) {
        super(props);
    }

    componentDidMount() {
        if ((this.props.selected || "") == "")
            this.props.onSelect(this.props.sections[0].toLocaleLowerCase());
    }

    public render() {
        var lower = (this.props.selected || "").toLocaleLowerCase();
        return <div className={this.props.className}>
            {
                this.props.sections.map(section => <span key={section}
                    onClick={() => this.props.onSelect(section.toLocaleLowerCase())}
                    className={`pagecontext ${ section.toLocaleLowerCase() ==lower? ' selected' : ''}`}>{section}</span>)
            }
        </div>;
    }
};
