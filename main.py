"""
Main application entry point for the Telegram-Cursor API relay.
"""
import asyncio
import signal
import sys
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
import uvicorn
from relay import TelegramCursorRelay
from logger import get_logger
from config import settings

logger = get_logger("main")

# Global relay instance
relay: TelegramCursorRelay = None

def create_app() -> FastAPI:
    """Create FastAPI application."""
    app = FastAPI(
        title="Telegram-Cursor API Relay",
        description="A relay system connecting Telegram bots with Cursor AI API",
        version="1.0.0"
    )
    
    @app.get("/")
    async def root():
        """Root endpoint."""
        return {
            "message": "Telegram-Cursor API Relay",
            "status": "running",
            "version": "1.0.0"
        }
    
    @app.get("/status")
    async def get_status():
        """Get relay status."""
        if not relay:
            raise HTTPException(status_code=503, detail="Relay not initialized")
        
        try:
            status = await relay.get_status()
            return status
        except Exception as e:
            logger.error(f"Error getting status: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/restart")
    async def restart_relay():
        """Restart the relay system."""
        if not relay:
            raise HTTPException(status_code=503, detail="Relay not initialized")
        
        try:
            await relay.stop()
            await relay.start()
            return {"message": "Relay restarted successfully"}
        except Exception as e:
            logger.error(f"Error restarting relay: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/health")
    async def health_check():
        """Health check endpoint."""
        return {"status": "healthy", "timestamp": asyncio.get_event_loop().time()}
    
    return app

async def setup_relay():
    """Setup the relay system."""
    global relay
    
    try:
        logger.info("Initializing Telegram-Cursor relay...")
        
        relay = TelegramCursorRelay()
        await relay.initialize()
        
        logger.info("Relay initialized successfully")
        
    except Exception as e:
        logger.error(f"Failed to initialize relay: {e}")
        sys.exit(1)

async def start_relay():
    """Start the relay system."""
    global relay
    
    try:
        await relay.start()
        logger.info("Relay started successfully")
        
    except Exception as e:
        logger.error(f"Failed to start relay: {e}")
        sys.exit(1)

async def stop_relay():
    """Stop the relay system."""
    global relay
    
    if relay:
        try:
            await relay.stop()
            logger.info("Relay stopped successfully")
        except Exception as e:
            logger.error(f"Error stopping relay: {e}")

def signal_handler(signum, frame):
    """Handle shutdown signals."""
    logger.info(f"Received signal {signum}, shutting down...")
    asyncio.create_task(stop_relay())
    sys.exit(0)

async def main():
    """Main application function."""
    # Setup signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        # Setup relay
        await setup_relay()
        
        # Create FastAPI app
        app = create_app()
        
        # Start relay in background
        asyncio.create_task(start_relay())
        
        # Start web server
        config = uvicorn.Config(
            app,
            host="0.0.0.0",
            port=settings.port,
            log_level=settings.log_level.lower()
        )
        server = uvicorn.Server(config)
        
        logger.info(f"Starting web server on port {settings.port}")
        await server.serve()
        
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    except Exception as e:
        logger.error(f"Application error: {e}")
    finally:
        await stop_relay()

if __name__ == "__main__":
    # Create logs directory
    import os
    os.makedirs("logs", exist_ok=True)
    
    # Run the application
    asyncio.run(main())