import traceback
try:
    import sentence_transformers
    print("SUCCESS: sentence_transformers loaded.")
except Exception as e:
    print("ERROR LOADING sentence_transformers:")
    print(traceback.format_exc())
