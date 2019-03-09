import { CollectionState, abstractActionCreators } from "../store/CollectionState";
import * as React from "react";
import { withRouter, RouteComponentProps } from "react-router";
import Material from "../store/Material";
import { actionCreators } from "../store/Material";
import { connect } from "react-redux";
import { ApplicationState } from "../store";
import MaterialListItemView, { MaterialListItemViewProps } from "./MaterialListItemView";
import SearchBar from "./SearchBar";
import { Modal } from "react-router-modal";

export type ListViewProps<T>
    = CollectionState<T>
    & abstractActionCreators<T>
    & { itemView: any, name: string, title: string, createDialog: (props:any) =>any | React.Component<any,any> }
    & RouteComponentProps<{}>
    ;

export type ListViewState<T> =
    {
        creating: boolean,
        includeArchived: boolean,
    }
    ;

/**
 * Template list view for a particular type T.
 * 
 * Implementation views can extend this class or use composition.
 */
export class ListView<T> extends React.Component<ListViewProps<T>, ListViewState<T>> {
    constructor(props: ListViewProps<T>) {
        super(props);
        this.state = {
            creating: false, includeArchived: this.props.location.search.indexOf("archived") >= 0
        };
    }

    render() {
        var { items, list, itemView, title, totalCount, loading, search } = this.props;

        return <div className='container container-wide'>
            <div className='row'>
                <SearchBar doSearch={(search: string) => {
                    this.props.requestItems(search, 0, -1, this.state.includeArchived);
                }} />
            </div>
            <div className='row'>
                <h2>
                    {title} {loading ? <small>loading...</small> : <small>{totalCount} total</small>}
                    <div className='btn-group btn-group-vertical pull-right'>
                        <button className='btn btn-primary'
                            onClick={() => {
                                this.setState({ creating: true });
                            }}
                        ><i className='glyphicon glyphicon-plus' /></button>
                    </div>
                    <h4 className='pull-right mr-2'><input type='checkbox'
                        checked={this.state.includeArchived}
                        onClick={() => {
                            var includeArchived = !this.state.includeArchived;
                            this.setState({ includeArchived });
                            this.props.requestItems(search, 0, -1, includeArchived);
                            this.props.history.replace(this.props.name + (includeArchived ? "?archived" : ""));
                        }} /> Show Archived</h4>
                </h2>
            </div>
            <div className='row'>
            {
                (list || []).map(id => {
                    var item = (items || {})[id];
                        return !item ? undefined : React.createElement(itemView, {
                            item,
                            key: id,
                            onArchive: () => this.props.requestArchiveItem (id),
                            onRestore: () => this.props.requestRestoreItem (id),
                            onPatch: (item: Partial<T>) => this.props.requestPatchItem (id, item),
                        });
                })
            }
            </div>
            {
                this.state.creating &&
                <Modal
                    component={this.props.createDialog}
                    onBackdropClick={() => this.setState({ creating: false })}
                    props={{
                        onCancel: (): any => this.setState({ creating: false }),
                        onComplete: (): any => this.setState({ creating: false }),
                    }}
                />
            }
        </div>;
    }
    componentDidMount() {
        this.props.requestItems(this.props.search, 0, -1, this.state.includeArchived);
    }
}
