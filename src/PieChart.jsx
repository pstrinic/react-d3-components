let React = require('react');
let d3 = require('d3');

let Chart = require('./Chart');
let Tooltip = require('./Tooltip');

let DefaultPropsMixin = require('./DefaultPropsMixin');
let HeightWidthMixin = require('./HeightWidthMixin');
let AccessorMixin = require('./AccessorMixin');
let TooltipMixin = require('./TooltipMixin');

let Wedge = React.createClass({
	propTypes: {
		d: React.PropTypes.string.isRequired,
		fill: React.PropTypes.string.isRequired
	},

	render() {
		let {fill, d, data, onMouseEnter, onMouseLeave} = this.props;

		return (
				<path
                    fill={fill}
                    d={d}
                    onMouseMove={ evt => { onMouseEnter(evt, data); } }
                    onMouseLeave={  evt => { onMouseLeave(evt); } }
				/>
		);
	}
});

let DataSet = React.createClass({
	propTypes: {
		pie: React.PropTypes.array.isRequired,
		arc: React.PropTypes.func.isRequired,
		outerArc: React.PropTypes.func.isRequired,
		colorScale: React.PropTypes.func.isRequired,
		radius: React.PropTypes.number.isRequired,
		strokeWidth: React.PropTypes.number,
		stroke: React.PropTypes.string,
		fill: React.PropTypes.string,
		opacity: React.PropTypes.number,
		x: React.PropTypes.func.isRequired
	},

	getDefaultProps() {
		return {
			strokeWidth: 2,
			stroke: '#000',
			fill: 'none',
			opacity: 0.3
		};
	},

	render() {
		let {pie,
            arc,
            outerArc,
            colorScale,
            radius,
            total,
            x,
            y,
            onMouseEnter,
            onMouseLeave
        } = this.props;

		let wedges = pie.map((e, index) => {
			function midAngle(d){
				return d.startAngle + (d.endAngle - d.startAngle)/2;
			}

			let d = arc(e);

			let linePos = outerArc.centroid(e);
			linePos[0] = radius * 0.95 * (midAngle(e) < Math.PI ? 1 : -1);

            let labelPos = arc.centroid(e)

            // Massive hack to hide values which will not fit in the wedge.
            // @todo: Replace with bounding box + collision logic
            let theValue = y(e.data);
            let theText = ("" + theValue).length > theValue/total*100 ? '' : theValue;

			return (
                <g key={`${x(e.data)}.${y(e.data)}.${index}`} className="arc">
					<Wedge
                        data={e.data}
                        fill={colorScale(x(e.data))}
                        d={d}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
					/>
					<text
                        dy=".35em"
                        x={labelPos[0]}
                        y={labelPos[1]}
                        textAnchor="middle">{theText}</text>
                </g>
			);
		});

		return (
				<g>
				{wedges}
			</g>
		);
	}
});
let Legend = React.createClass({
    mixins: [DefaultPropsMixin,
        HeightWidthMixin,
        AccessorMixin,
        TooltipMixin
    ],
    propTypes: {
        innerRadius: React.PropTypes.number,
        outerRadius: React.PropTypes.number,
        labelRadius: React.PropTypes.number,
        padRadius: React.PropTypes.string,
        cornerRadius: React.PropTypes.number,
        sort: React.PropTypes.any
    },
    getDefaultProps() {
        return {
            innerRadius: null,
            outerRadius: null,
            labelRadius: null,
            padRadius: 'auto',
            totalScale: 3.5,
            cornerRadius: 0,
            sort: undefined
        };
    },
    render() {

        const data = this.props.data;

        // @todo: make this configurable
        let offsetY = 20;
        const theSize = 12;
        const margin = 3;

        // center legend vertically
        let legendHeight = data.values.length * offsetY + margin;
        const startX = this.props.innerWidth + 10;
        let startY = (this.props.height / 2) - (legendHeight / 2);

        return (
            <g transform={`translate(${startX}, ${startY})`}>
                {data.values.map((item, index) => {
                    return <g key={`legend:${item.x}`} >
                            <rect x={margin}  y={(offsetY * index) + margin} width={theSize + margin}
                                height={theSize + margin}
                                fill={this.props.colorScale(item.x)} />
                            <text x={margin} y={(offsetY * (index)) + theSize + margin} dx="1.5em"
                                textAnchor="start"
                                style={{
                                    fontFamily: "Roboto",
                                    fontSize: theSize,
                                    stroke: "#000",
                                    fill: "#000"
                                }}>{item.x}</text>
                        </g>
                })}
            </g>
        );
    }
});
let PieChart = React.createClass({
	mixins: [DefaultPropsMixin,
			 HeightWidthMixin,
			 AccessorMixin,
			 TooltipMixin],

	propTypes: {
		innerRadius: React.PropTypes.number,
		outerRadius: React.PropTypes.number,
		labelRadius: React.PropTypes.number,
		padRadius: React.PropTypes.string,
		cornerRadius: React.PropTypes.number,
		sort: React.PropTypes.any
	},

	getDefaultProps() {
		return {
			innerRadius: null,
			outerRadius: null,
			labelRadius: null,
            padRadius: 'auto',
            totalScale: 3.5,
			cornerRadius: 0,
			sort: undefined
		};
	},

	_tooltipHtml(d, position) {
        let html = this.props.tooltipHtml(this.props.x(d), this.props.y(d));

        return [html, 0, 0];
	},

	render() {
		let {data,
            width,
            height,
            margin,
            totalScale,
            colorScale,
            innerRadius,
            outerRadius,
            labelRadius,
            padRadius,
            cornerRadius,
            showTotal,
            sort,
            x,
            y,
            values} = this.props;

		let [innerWidth, innerHeight] = [
            this._innerWidth,
            this._innerHeight];

        // TOTAL IN THE CENTER
        const centerX = 0;
        const centerY = 0;
        let total = 0;

		let pie = d3.layout.pie()
            .value(e => { total+=y(e); return y(e); });

		if (typeof sort !== 'undefined') {
			pie = pie.sort(sort);
		}

		let radius = Math.min(innerWidth, innerHeight) / 2;
		if (!innerRadius) {
			innerRadius = radius * 0.8;
		}

		if (!outerRadius) {
			outerRadius = radius * 0.4;
		}

		if (!labelRadius) {
			labelRadius = radius * 0.9;
		}

		let arc = d3.svg.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius)
            .padRadius(padRadius)
            .cornerRadius(cornerRadius);

		let outerArc = d3.svg.arc()
            .innerRadius(labelRadius)
            .outerRadius(labelRadius);

		let pieData = pie(values(data));

		let translation = `translate(${innerWidth/2}, ${innerHeight/2})`;

		return (
			<div>
				<Chart height={height} width={width} margin={margin}>
                    <g transform={translation}>
                        <DataSet
                            width={innerWidth}
                            height={innerHeight}
                            colorScale={colorScale}
                            total={total}
                            pie={pieData}
                            arc={arc}
                            outerArc={outerArc}
                            radius={radius}
                            x={x}
                            y={y}
                            onMouseEnter={this.onMouseEnter}
                            onMouseLeave={this.onMouseLeave}
                        />
                        {showTotal ?
                            <text
                                dy=".35em"
                                style={{
                                    fontFamily: "Roboto",
                                    fontSize: radius/totalScale,
                                    stroke: "#000",
                                    fill: "#000"
                                }}
                                x={centerX}
                                y={centerY}
                                textAnchor="middle">{total}</text>: ''
                        }
                    </g>
                    { this.props.children }

                    {this.props.legend ?
                        <Legend width={width} height={height} colorScale={colorScale} data={data} innerWidth={innerWidth} />: ''
                    }
				</Chart>

                <Tooltip {...this.state.tooltip}/>
				</div>
		);
	}
});

module.exports = PieChart;
