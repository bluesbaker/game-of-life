// the "special" list for the "mousepress" listeners
let mousePressList = [];

function removeListener(type, listener, options) {
    let self = this;

    // many event types
    if(Array.isArray(type)) type.map(t => deleteEventListener(t, listener, options));
    // only one event type
    else deleteEventListener(type, listener, options);

    // decorator for "removeEventListener"
    function deleteEventListener(type, listener, options) {
        switch(type) {
            // the "mousepress" event
            case 'mousepress':
                // filtered list 
                let removeList = mousePressList.filter(al => (al.source === self) && (al.listener === listener));

                // remove listeners 
                for(let i = 0; i < removeList.length; i++) {
                    self.removeListener(removeList[i].event, removeList[i].handler, options);
                }

                // and rebuild list
                mousePressList = mousePressList.filter(al => removeList.indexOf(al) < 0);
                break;
            
            // and other events     
            default:
                self.removeEventListener(type, listener, options);
                break;
        }
    }
}

function addListener(type, listener, options) {
    let self = this;

    // many event types
    if(Array.isArray(type)) type.map(t => appendEventListener(t, listener, options));
    // only one event type
    else appendEventListener(type, listener, options);

    // decorator for "addEventListener"
    function appendEventListener(type, listener, options) {
        switch(type) {
            // the "mousepress" event
            case 'mousepress':
                let loopId = null;
                let interval = options?.interval || 0;
                let mouseMoveEvent = null;
                let mouseMoveListener = function(event) {
                    mouseMoveEvent = event;
                }

                // the "mousedown" listener
                let mouseDownHandler = function(event) {
                    event.preventDefault();
                    mouseMoveEvent = event;
                    // usage mousemove event in order to get a current mouse position
                    self.addListener('mousemove', mouseMoveListener);
                    loopId = setInterval(() => {
                        listener(mouseMoveEvent);
                    }, interval);
                }

                // the "mouseup" and "mouseleave" listener
                let mouseUpHandler = function(event) {
                    self.removeEventListener('mousemove', mouseMoveListener);
                    clearInterval(loopId);
                }

                // add listeners
                self.addListener('mousedown', mouseDownHandler, options);    
                self.addListener(['mouseup', 'mouseleave'], mouseUpHandler, options);

                // add to list to be removed in the future
                mousePressList.push(
                    {
                        source: self,
                        event: 'mousedown',
                        listener: listener,
                        handler: mouseDownHandler
                    },
                    {
                        source: self,
                        event: ['mouseup', 'mouseleave'],
                        listener: listener,
                        handler: mouseUpHandler
                    }
                );
                break;

            // and other events        
            default:
                self.addEventListener(type, listener, options);
                break;
        }
    }
}

export { addListener, removeListener }