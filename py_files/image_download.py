import re
import base64
# ...
class SaveHandler(webapp.RequestHandler):
dataUrlPattern = re.compile('data:image/(png|jpeg);base64,(.*)$')
def post(self):
# ...
imgdata = self.request.get('imgdata')
imgb64 = self.dataUrlPattern.match(imgdata).group(2)
if imgb64 is not None and len(imgb64) > 0:
        datamodel.image = db.Blob(base64.b64decode(imgb64)) 
