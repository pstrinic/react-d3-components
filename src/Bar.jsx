let React = require('react');
let d3 = require('d3');

let Bar = React.createClass({
    propTypes: {
        width: React.PropTypes.number.isRequired,
        height: React.PropTypes.number.isRequired,
        x: React.PropTypes.number.isRequired,
        y: React.PropTypes.number.isRequired,
        fill: React.PropTypes.string.isRequired,
        data: React.PropTypes.oneOfType([
            React.PropTypes.array,
            React.PropTypes.object
        ]).isRequired,
        onMouseEnter: React.PropTypes.func,
        onMouseLeave: React.PropTypes.func
    },

    render() {
        let {x,
             y,
             width,
             height,
             fill,
             data,
             onMouseEnter,
             onMouseLeave} = this.props;

        return (
                <g>
                    <rect
                        className="bar"
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={fill}
                        onMouseMove={ e => { onMouseEnter(e, data); } }
                        onMouseLeave={ e => { onMouseLeave(e); } }
                    />
                    <text textAnchor="start" dx=".3em" dy=".3em" x={x + width} y={y + (height/2)}>{data.y}</text>
                </g>
        );
    }
});

module.exports = Bar;
