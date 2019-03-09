import * as React from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import { connect } from 'react-redux';
import { ApplicationState }  from '../store';
import * as WeatherForecastsState from '../store/WeatherForecasts';
import Material, * as Materials from '../store/Material';
import PromptDialog from './dialogs/PromptDialog';
import { Modal } from 'react-router-modal';
import ListItemView, { ListItemViewProps } from './ListItemView';
import AttributeEditor from './AttributeEditor';

export type MaterialListItemViewProps = ListItemViewProps<Material>;

export type MaterialListItemViewState = { editing: string };

/**
 * Preferring composition over inheritance.
 * 
 * The benefit is that we can choose to manipulate the children of the basic item view to provide a more interesting UI.
 * 
 * The tradeoff is that the props have to be managed here and in the basic item view class.
 */
export default class MaterialListItemView extends React.Component<MaterialListItemViewProps, MaterialListItemViewState> {
    constructor(props: MaterialListItemViewProps) {
        super(props);
        this.state = { editing: "" };
    }

    public render() {
        return <ListItemView {...this.props} editing={this.state.editing} category="materials" item={this.props.item}>
            <div className='mt-1' /><small>
                {
                    this.state.editing != "units" ?
                        <div className="" onClick={(e) => {
                            e.preventDefault();
                            this.setState({ editing: "units" });
                        }}>
                            {this.props.item.units || "no units"}
                            <i className='glyphicon glyphicon-pencil ml-h' style={{opacity:.5}} />
                        </div>
                        : <AttributeEditor type='text' className='mt-h' initialValue={this.props.item.units}
                            onCancel={() => { this.setState({ editing: "" }); }}
                            onChange={(units: string) => {
                                var item: Partial<Material> = {};
                                item.units = units;
                                this.props.onPatch(item);
                                this.setState({ editing: "" });
                            }}
                            />
                }
            </small>
        </ListItemView>;
    }
}