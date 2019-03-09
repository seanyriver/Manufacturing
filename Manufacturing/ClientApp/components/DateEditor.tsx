import * as React from 'react';
import { connect } from 'react-redux';
import { ApplicationState } from '../store';
import { RouteComponentProps } from 'react-router';
import { ActionButton } from './ActionButton';
import { FormatDate } from '../store/Value';

type DateEditorProps = {
    onCancel: any,
    onChange: any,
    onClear: any,
    min?: Date,
    max?: Date,
    initialValue: any,
    children?: any,
    context?: any,
};

export default class DateEditor extends React.Component<DateEditorProps, { years: number[], days: any[], selected?: Date, selectedInvalid?: boolean, window: Date }> {
    constructor(props: DateEditorProps) {
        super(props);
        var initial = new Date(props.initialValue || Date.now());
        var selected : any;
        selected = new Date(props.initialValue);
        if (!props.initialValue || props.initialValue == "" || selected && isNaN(selected.getTime()))
            selected = null;

        this.state = {
            years: DateEditor.years(initial),
            selected: selected,
            window: initial,
            days: this.computeDays(initial.getFullYear(), initial.getMonth())
        };
        this.input = null;
    }

    private input: HTMLInputElement | null;

    static years(initialValue: Date) {
        var thisYear = (initialValue || new Date()).getFullYear();
        return [thisYear - 2, thisYear - 1, thisYear, thisYear + 1, thisYear + 2];
    }

    static months: { label: string, value: number }[] = [
        {label: "Jan", value: 0},
        {label: "Feb", value: 1},
        {label: "Mar", value: 2},
        {label: "Apr", value: 3},
        {label: "May", value: 4},
        {label: "Jun", value: 5},
        {label: "Jul", value: 6},
        {label: "Aug", value: 7},
        {label: "Sep", value: 8},
        {label: "Oct", value: 9},
        {label: "Nov", value: 10},
        {label: "Dec", value: 11},
    ];

    componentDidMount() {
        this.updateInputField();
    }

    componentDidUpdate() {
        this.updateInputField();
    }

    updateInputField() {
        if (this.input && this.input != document.activeElement)
            this.input.value = FormatDate(this.state.selected) || "";
    }

    render() {
        var { window, selected } = this.state;

        var onInput = (e:any) => {
            if (this.input) {
                var newDate = new Date(this.input.value);
                if (isNaN(newDate.getTime()))
                    this.setState({ selected: undefined, selectedInvalid: true });
                else
                    this.setState({ selected: newDate, selectedInvalid: undefined });
            }
        };

        return <div className={'datepicker' + (this.state.selectedInvalid ? ' invalid' : '')}>
            <div className='input-group mb-1'>
                <input type='text' className='form-control' ref={(e) => { this.input = e; this.updateInputField(); }}
                    onChange={onInput} onKeyPress={onInput} onPaste={onInput}
                     />
            <div className='input-group-btn'>
                    <ActionButton label='cancel' onClick={this.props.onCancel} />
                    <ActionButton className='btn-success' disabled={this.state.selectedInvalid} iconSuffix='ok' onClick={() => {
                        this.props.onChange(this.state.selected);
                    }} />
                </div>
            </div>
            <div className='controls'>
                <div className='years'>
                    <div className='year year-arrow' onClick={() => { this.adjustYears(-5); }}>▲</div>
                {
                    this.state.years.map((year) => {
                            return <div className={'year'
                                + (window.getFullYear() == year ? ' selected' : '')
                                + (selected && selected.getFullYear() == year ? ' current' : '')}
                                onClick={() => {
                                    var tmp = new Date(this.state.window); tmp.setFullYear(year);
                                    var days = this.computeDays(year, this.state.window.getMonth());
                                    this.setState({ window: tmp, days: days });
                                }}>{year}</div>;
                    })
                }
                    <div className='year year-arrow' onClick={() => { this.adjustYears(+5); }}>▼</div>
            </div>
            <div className='months'>
                {
                    DateEditor.months.map((month) => {
                            return <span className={'month'
                                + (window.getMonth() == month.value ? ' selected' : '')
                                + (selected && selected.getMonth() == month.value && selected.getFullYear() == window.getFullYear() ? ' current' : '')}
                                onClick={() => {
                                var tmp = new Date(this.state.window); tmp.setMonth(month.value); this.setState({ window: tmp });
                                var days = this.computeDays(this.state.window.getFullYear(), month.value);
                                this.setState({ window: tmp, days: days });
                            }}>{month.label}</span>;
                    })
                }
            </div>
                    {
                        this.getDays ()
                    }
                </div>
        </div>;
    }

    getDays() {
        var current = this.state.selected; //new Date();

        return <div className='days'>
            <div className='days-h'>
                <span className='day'>S</span>
                <span className='day'>M</span>
                <span className='day'>T</span>
                <span className='day'>W</span>
                <span className='day'>R</span>
                <span className='day'>F</span>
                <span className='day'>S</span>
            </div>
            <div>
                {
                    this.state.days.map((day) => {
                        return <div className={'day'
                            + (this.canSet(day) ? '' : ' day-disabled')
                            + (this.sameMonth(day, this.state.window) ? '' : ' day-near')
                            + (this.datesMatch(day, this.state.selected) ? ' selected' : '')
                            + (this.datesMatch(day, current) ? ' current' : '')}
                            onClick={() => { this.setState({ selected: day, selectedInvalid: undefined }); }}
                        >{day.getDate()}</div>;
                    })
                }
            </div>
        </div>;
    }

    canSet(d1: Date) {
        if (this.props.min && d1.getTime() < this.props.min.getTime())
            return false;
        
        if (this.props.max && d1.getTime() > this.props.max.getTime())
            return false;

        return true;
    }

    sameMonth(d1: Date, d2: Date) {
        if (!d1 || !d2)
            return false;

        return d1.getMonth() == d2.getMonth();
    }

    datesMatch(d1?: Date, d2?: Date) {
        if (!d1 || !d2)
            return false;

        if (d1.getFullYear() != d2.getFullYear())
            return false;

        if (d1.getMonth() != d2.getMonth())
            return false;

        if (d1.getDate() != d2.getDate())
            return false;

        return true;
    }

    computeDays(year:number, month:number) {
        // Given the selected date, figure out the first Sunday
        var newDate = new Date(year, month, 1);
        var firstDayOffset = -newDate.getDay();
        newDate.setDate(newDate.getDate() + firstDayOffset);
        var result = [];
        while (true) {
            result.push(newDate);
            newDate = new Date(newDate);
            newDate.setDate(newDate.getDate() + 1);

            if ((newDate.getMonth() > month || newDate.getFullYear() > year) &&
                result.length % 7 == 0)
                break;
        }
        return result;
    }

    timeDiff(date1:Date, date2:Date) {
        var timeDiff = Math.abs(date2.getTime() - date1.getTime());
        var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
        return diffDays;
    }

    adjustYears(offset: number) {
        var years = this.state.years.map((year) => { return year + offset; });
        this.setState({ years: years });
    }
};
