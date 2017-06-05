
import java.io.IOException;
import java.math.BigInteger;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

/**
 * Servlet implementation class ProofOfWorkService
 */
@WebServlet("/")
public class ProofOfWorkService extends HttpServlet {
	private static final long serialVersionUID = 1L;
	private Gson gson = new Gson();

	private List<String> calculate(BigInteger target) throws NoSuchAlgorithmException {
		MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
		BigInteger nonce = BigInteger.ONE;
		long duration = System.currentTimeMillis();
		BigInteger hash = BigInteger.ZERO;
		while (true) {
			hash = new BigInteger(1, sha256.digest(nonce.toByteArray()));
			if (target.compareTo(hash) == 1) {
				System.out.println(hash);
				System.out.println(target);
				duration = System.currentTimeMillis() - duration;
				break;
			} else {
				nonce = nonce.add(BigInteger.ONE);
			}
		}
		List<String> result = new ArrayList<>();
		result.add(nonce.toString());
		result.add(hash.toString());
		result.add(duration + "");
		return result;
	}

	/**
	 * @see HttpServlet#HttpServlet()
	 */
	public ProofOfWorkService() {
		super();
		// TODO Auto-generated constructor stub
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		try {
			BigInteger target = new BigInteger(request.getParameter("target").substring(2), 16);
			List<String> result = calculate(target);
			response.setContentType("application/json");
			response.setCharacterEncoding("UTF-8");
			String json = gson.toJson(result);
			response.getWriter().write(json);
			response.getWriter().flush();
		} catch (NoSuchAlgorithmException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request, HttpServletResponse response)
			throws ServletException, IOException {
		// TODO Auto-generated method stub
		doGet(request, response);
	}

}
