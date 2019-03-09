import * as React from 'react';

type Props = {
    doSearch: any,
    skipInitialSearch?: boolean,
    onKeyDown?: any,
    className?: any,
    lag?: number,
    placeholder?: string,
    initialValue?: string,
};

type State = {
    searchTimeout: any
};

export default class SearchBar extends React.Component<Props,State> {
    constructor(props:any) {
        super(props);

        this.input = null;
    }

    componentWillMount() {
        this.props.doSearch && !this.props.skipInitialSearch && this.props.doSearch("");
    }

    componentDidMount() {
        if (this.props.initialValue && this.input)
            this.input.value = this.props.initialValue;
    }

    componentWillUnmount() {
        this.clearSearch();
    }

    clearSearch() {
        if (this.state && this.state.searchTimeout) {
            clearTimeout(this.state.searchTimeout);
            this.setState({ searchTimeout: undefined });
        }
    }

    input: HTMLInputElement | null;

    public render() {
        var doSearch = () => {
            if (!this.input)
                return;

            this.clearSearch();
            var { value } = this.input;
            var tmp = setTimeout(() => {
                this.props.doSearch(value);
            }, this.props.lag || 200);
            this.setState({ searchTimeout: tmp });
        };

        var { onKeyDown } = this.props;

        return <div className={'searchbar' + (this.props.className ? " " + this.props.className : "")}>
            <div className="input-group stylish-input-group">
                <input type="text" ref={e => this.input = e} className="form-control" placeholder={this.props.placeholder || "Search"} onChange={doSearch} onKeyDown={onKeyDown} />
                <span className="input-group-addon">
                    <button type="submit">
                        <span className="glyphicon glyphicon-search" onClick={doSearch} ></span>
                    </button>
                </span>
            </div>
        </div>;
    }
};
