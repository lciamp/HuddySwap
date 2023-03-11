import React from 'react'

// note: these buttons are for display only
const PageButton = props => {
    return (
        <div className="btn">
            <span className={props.isBold ? "pageButtonBold hoverBold" : "hoverBold"}>
                {props.name}
            </span>
        </div>
    )
}

export default PageButton