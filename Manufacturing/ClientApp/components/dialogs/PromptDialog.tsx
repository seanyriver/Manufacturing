import * as React from 'react';

export type PromptProps =
    {
        message: string,
        options: string[],
        primaryOption?: string,
        onOptionSelected: (option: string) => any
    };

class PromptDialog extends React.Component<PromptProps> {
    constructor(props: any) {
        super(props);
    }

    render() {
        return <div className="container mr-2 ml-2 mb-2" style={{ maxWidth: 500 }}>
            <div className='row mt-2'>
                <div className='h4'>{this.props.message}</div>
            </div>
            <div className='row mt-2' style={{textAlign:"right"}}>
                {
                    this.props.options.map((option) => <div key={option} className={'ml-1 btn btn-' + (option == this.props.primaryOption ? "primary" : "default")}
                        onClick={() => this.props.onOptionSelected(option)}>{option}</div>)
                }
            </div>
        </div>;
    }
}

export default PromptDialog;
