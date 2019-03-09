import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as WeatherForecastsState from '../store/WeatherForecasts';
import PromptDialog from './dialogs/PromptDialog';
import { Modal } from 'react-router-modal';
import NamedEntity from '../store/NamedEntity';
import { ReactEventHandler } from 'react';
import AttributeEditor from './AttributeEditor';

export type ListItemViewProps<T extends NamedEntity> =
    {
        item: T,
        onArchive: () => any,
        onRestore: () => any,
        onPatch: (item: Partial<T>) => any,
        category: string,
        panel?: boolean,//defaults to true
        showName?: boolean,//defaults to true
        editing?: string;
    }
    ;

export type ListItemViewState = {
    promptToRemove: boolean;
    editing: string;
}

export default class ListItemView<T extends NamedEntity> extends React.Component<ListItemViewProps<T>, ListItemViewState> {
    constructor(props: ListItemViewProps<T>) {
        super(props);
        this.state = { promptToRemove: false, editing: "" };
    }

    componentWillReceiveProps(newProps : ListItemViewProps<T>) {
        var { editing } = newProps;
        if (editing != undefined)
            this.setState({ editing });
    }

    getRemoveLabel(item: T, title: boolean = true) {
        if (!item) return "";
        var result = item.archived ? "Restore" : "Archive";
        return title ? result : result.toLocaleLowerCase();
    }

    getLink(item: T) {
        return <Link to={`/${this.props.category}/${item.id}`}>{this.getPanel(item)}</Link>;
    }

    getName(item: T) {
        if (this.props.showName == false)
            return null;

        return this.state.editing == "name"
            ? <AttributeEditor type='text' initialValue={item.name}
                onCancel={() => this.setState({ editing: "" })}
                onChange={(name: string) => {
                    var update: Partial<T> = {};
                    update.name = name;
                    this.props.onPatch(update);
                    this.setState({ editing: "" });
                }} />
            : <div>{item.name} <small className='glyphicon glyphicon-pencil' onClick={(e: any) => {
                e.preventDefault();
                this.setState({ editing: "name" });
            }} /></div>;
    }

    getContents(item: T, className?: string) {
        return <div className={className}>
            {
                this.state.editing == "" &&
                <button className={`btn btn-${item.archived ? "info" : "danger"} pull-right`}
                    onClick={(e: any) => { e.preventDefault(); this.setState({ promptToRemove: true }); }}
                ><i className={`glyphicon glyphicon-${item.archived ? "leaf" : "trash"}`} /></button>
            }
            {
                <span><h3 className='media-heading'> {this.getName(item)} {this.props.children} </h3></span>
            }
        </div>;
    }

    getPanel(item: T) {
        var contents = this.getContents(item, `${this.props.panel == false? "panel-inline" : "panel-body"} ${item.archived ? 'panel-archived' : ''} `);

        //return this.props.panel == false ? contents :
        return <div className={`panel panel-default`}>{contents}</div>;
    }

    getPrompt(item: T) {
        return !this.state.promptToRemove ? null :
            <Modal component={PromptDialog}
                onBackdropClick={() => { this.setState({ promptToRemove: false }); }}
                props={{
                    message: "Are you sure you want to " + this.getRemoveLabel(item, false) + " `" + item.name + "`?",
                    options: ["Cancel", this.getRemoveLabel(item)], primaryOption: this.getRemoveLabel(item), onOptionSelected: (option: string) => {
                        if (option == this.getRemoveLabel(item)) {
                            if (item.archived)
                                this.props.onRestore();
                            else
                                this.props.onArchive();
                        }

                        this.setState({ promptToRemove: false });
                    }
                }} />;
    }

    public render() {
        var { item } = this.props;
        if (!item)
            return null;

        return <span>{this.state.editing ? this.getPanel(item) : this.getLink(item)}{this.getPrompt(item)}</span>;
    }
}