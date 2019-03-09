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
import MaterialListItemView from './MaterialListItemView';
import { CollectionState, abstractActionCreators } from '../store/CollectionState';

export type NamedEntityViewProps<T extends NamedEntity, R> =
    CollectionState<T> &
    abstractActionCreators<T> &
    RouteComponentProps<{
        id: string
    } & R> &
    {
        category: string,
        itemView: any,
    }
    ;

export type NamedEntityViewState = {
    promptToRemove: boolean;
    editing: string;
}

export default class NamedEntityView<T extends NamedEntity,R> extends React.Component<NamedEntityViewProps<T,R>, NamedEntityViewState> {
    constructor(props: NamedEntityViewProps<T,R>) {
        super(props);
        this.state = { promptToRemove: false, editing: "" };
    }

    public render() {
        var { match, items } = this.props;
        var { id } = match.params;

        var item = items[id];
        if (!item)
            return null;

        var ListItemView = this.props.itemView;

        return <div className='container container-wide'>
            <div className='row mt-2'>
                <ListItemView item={item} {...this.props}
                    onArchive={() => {
                        this.props.requestArchiveItem(id);
                    }}
                    onRestore={() => {
                        this.props.requestRestoreItem(id);
                    }}
                    onPatch={(item: any) => {
                        this.props.requestPatchItem(id, item);
                    }} />
            </div>
            {
                this.props.children
            }
        </div>;
    }

    componentDidMount() {
        this.props.requestItem(this.props.match.params.id);
    }
}