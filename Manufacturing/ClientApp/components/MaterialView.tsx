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
import Material, { actionCreators } from '../store/Material';
import NamedEntityView, { NamedEntityViewProps } from './NamedEntityView';
import { withRouter } from 'react-router';
import SectionBar from './SectionBar';

type RouteProps = { section: string; }
type MaterialViewProps = NamedEntityViewProps<Material, RouteProps>;

class View extends NamedEntityView<Material,RouteProps> {
    constructor(props: MaterialViewProps) { super(props); }
    render() { return super.render(); }
}

class MaterialView extends React.Component<MaterialViewProps> {
    constructor(props: MaterialViewProps) {
        super(props);
    }

    public render() {
        return <View {...this.props}>
            <div className='row'>
                <div className='col-12'>
                    <SectionBar sections={["Needed", "Ordered", "Stock", "Consumed"]}
                        selected={this.props.match.params.section}
                        className="mt-1"
                        onSelect={selection => {
                            this.props.history.replace(`/${this.props.category}/${this.props.match.params.id}/${selection}` )
                        }}
                    />
                </div>
            </div>
        </View >;
    }
}

export default withRouter<MaterialViewProps>(
    connect((state: ApplicationState) => Object.assign({},
        state.materials,
        { itemView: MaterialListItemView, category: "materials", title: "Materials", panel: false, }
    ),
        actionCreators
    )(MaterialView as any) as any) as typeof MaterialView;
