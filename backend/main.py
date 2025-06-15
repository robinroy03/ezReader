from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv
from typing import List, Dict, Any

# Load environment variables
load_dotenv()

app = FastAPI(title="Learning Roadmap API")

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # Alternative frontend port
        "http://localhost",        # Nginx proxy
        "http://localhost:80",     # Nginx proxy explicit port
        "http://127.0.0.1:5173",   # Alternative localhost format
        "http://127.0.0.1",        # Alternative localhost format
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

class TextInput(BaseModel):
    text: str

class RoadmapNode(BaseModel):
    id: str
    label: str
    indegree_id: List[str]
    outdegree_id: List[str]

class RoadmapResponse(BaseModel):
    roadmap: List[RoadmapNode]

def get_gemini_response(text: str) -> List[Dict[str, Any]]:
    """
    Generate a learning roadmap from text using Gemini API with function calling
    """
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    # Define the function schema for structured output
    roadmap_schema = {
        "type": "object",
        "properties": {
            "roadmap": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "id": {"type": "string"},
                        "label": {"type": "string"},
                        "indegree_id": {
                            "type": "array",
                            "items": {"type": "string"}
                        },
                        "outdegree_id": {
                            "type": "array",
                            "items": {"type": "string"}
                        }
                    },
                    "required": ["id", "label", "indegree_id", "outdegree_id"]
                }
            }
        },
        "required": ["roadmap"]
    }
    
    prompt = f"""
    Analyze the following text and create a learning roadmap that shows the logical progression of concepts and topics.
    
    Text: {text}
    
    Instructions:
    1. Break down the content into key learning nodes/concepts
    2. Each node should have a unique ID (use numbers like "1", "2", "3", etc.)
    3. Each node should have a descriptive label explaining what will be learned
    4. Create dependencies between nodes using indegree_id and outdegree_id:
       - indegree_id: list of node IDs that should be completed BEFORE this node
       - outdegree_id: list of node IDs that come AFTER this node
    5. Ensure there's a logical learning flow from basic to advanced concepts
    6. Make sure the roadmap represents a clear learning path
    7. Aim for 8-15 nodes for a comprehensive roadmap
    8. All values must be strings, including IDs
    
    Return ONLY a JSON object with the specified structure. Do not include any explanatory text.
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=roadmap_schema
            )
        )
        
        result = json.loads(response.text)
        return result["roadmap"]
    
    except Exception:
        # Fallback: try without schema if function calling fails
        try:
            response = model.generate_content(prompt)
            # Try to extract JSON from response
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:-3]
            elif response_text.startswith("```"):
                response_text = response_text[3:-3]
            
            result = json.loads(response_text)
            if "roadmap" in result:
                return result["roadmap"]
            else:
                return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error generating roadmap: {str(e)}")

@app.post("/generate-roadmap", response_model=RoadmapResponse)
async def generate_roadmap(input_data: TextInput):
    """
    Generate a learning roadmap from input text
    """
    try:
        if not input_data.text.strip():
            raise HTTPException(status_code=400, detail="Text input cannot be empty")
        
        roadmap_data = get_gemini_response(input_data.text)
        
        # Validate and ensure all required fields are present
        validated_roadmap = []
        for node in roadmap_data:
            validated_node = RoadmapNode(
                id=str(node.get("id", "")),
                label=str(node.get("label", "")),
                indegree_id=[str(x) for x in node.get("indegree_id", [])],
                outdegree_id=[str(x) for x in node.get("outdegree_id", [])]
            )
            validated_roadmap.append(validated_node)
        
        return RoadmapResponse(roadmap=validated_roadmap)
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Learning Roadmap API is running!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Backend API is running"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Learning Roadmap API server...")
    print("📡 Server will be available at: http://0.0.0.0:8000")
    print("🏥 Health check: http://0.0.0.0:8000/health")
    print("🗺️  Roadmap endpoint: http://0.0.0.0:8000/generate-roadmap")
    uvicorn.run(app, host="0.0.0.0", port=8000) 