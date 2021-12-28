export default function Modal({ handleClose, show, children, title }){
    const showHideClassName = show ? "modal show modal-open d-block" : "modal d-none";

    return (
        <>
        <div class={show ? "modal-overlay" : "d-none"}>
        <div class={showHideClassName}>
                <div class="modal-dialog">
                    <div class="modal-content bg-lighter">
                        <div class="modal-header">
                            <div class="modal-title">{title && (title)}</div>
                            <button class="btn-close btn-close-white" onClick={handleClose}></button>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}
