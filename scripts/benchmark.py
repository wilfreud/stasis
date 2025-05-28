#!/usr/bin/env python3
"""
🚀 Stasis PDF Generator Benchmark Script
========================================

Benchmarks the Stasis PDF generation service using the test endpoint
to evaluate performance metrics including response times, throughput,
and error rates.
"""

import asyncio
import aiohttp
import time
import statistics
import json
from typing import List, Dict, Any
from dataclasses import dataclass
from datetime import datetime
import argparse


@dataclass
class BenchmarkResult:
    """Data class to store benchmark results"""
    response_time: float
    status_code: int
    success: bool
    file_size: int = 0
    error_message: str = ""


class StasisBenchmark:
    """Benchmarking class for Stasis PDF Generator"""
    
    def __init__(self, base_url: str = "http://localhost:7070"):
        self.base_url = base_url
        self.test_endpoint = f"{base_url}/api/documents/test"
        self.health_endpoint = f"{base_url}/api/health"
        
    async def check_health(self) -> bool:
        """🏥 Check if the service is healthy before benchmarking"""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(self.health_endpoint) as response:
                    if response.status == 200:
                        data = await response.json()
                        print(f"✅ Service is healthy: {data.get('service', 'Unknown')}")
                        return True
                    else:
                        print(f"❌ Health check failed with status: {response.status}")
                        return False
        except Exception as e:
            print(f"❌ Health check failed: {str(e)}")
            return False
    
    async def single_request(self, session: aiohttp.ClientSession) -> BenchmarkResult:
        """🎯 Execute a single PDF generation request"""
        start_time = time.time()
        
        try:
            async with session.get(self.test_endpoint) as response:
                end_time = time.time()
                response_time = (end_time - start_time) * 1000  # Convert to ms
                
                if response.status == 200:
                    content = await response.read()
                    return BenchmarkResult(
                        response_time=response_time,
                        status_code=response.status,
                        success=True,
                        file_size=len(content)
                    )
                else:
                    error_text = await response.text()
                    return BenchmarkResult(
                        response_time=response_time,
                        status_code=response.status,
                        success=False,
                        error_message=f"HTTP {response.status}: {error_text[:200]}"  # Limit error message length
                    )
                    
        except asyncio.TimeoutError as e:
            end_time = time.time()
            response_time = (end_time - start_time) * 1000
            return BenchmarkResult(
                response_time=response_time,
                status_code=0,
                success=False,
                error_message=f"Timeout after {response_time:.0f}ms"
            )
        except aiohttp.ClientError as e:
            end_time = time.time()
            response_time = (end_time - start_time) * 1000
            return BenchmarkResult(
                response_time=response_time,
                status_code=0,
                success=False,
                error_message=f"Client error: {str(e)[:200]}"
            )
        except Exception as e:
            end_time = time.time()
            response_time = (end_time - start_time) * 1000
            return BenchmarkResult(
                response_time=response_time,
                status_code=0,
                success=False,
                error_message=f"Unexpected error: {str(e)[:200]}"
            )
    
    async def concurrent_benchmark(self, concurrent_users: int, requests_per_user: int, timeout_seconds: int = 30) -> List[BenchmarkResult]:
        """⚡ Run concurrent benchmark with multiple users"""
        print(f"🚀 Starting concurrent benchmark:")
        print(f"   👥 Concurrent users: {concurrent_users}")
        print(f"   📋 Requests per user: {requests_per_user}")
        print(f"   📊 Total requests: {concurrent_users * requests_per_user}")
        print(f"   ⏱️  Request timeout: {timeout_seconds}s")
        
        async def user_requests(session: aiohttp.ClientSession) -> List[BenchmarkResult]:
            """Execute requests for a single user"""
            return [await self.single_request(session) for _ in range(requests_per_user)]
        
        # Create connector with appropriate limits
        connector = aiohttp.TCPConnector(limit=concurrent_users * 2)
        # Set timeouts appropriate for PDF generation
        timeout = aiohttp.ClientTimeout(
            total=timeout_seconds,               # Total request timeout
            connect=min(10, timeout_seconds//3), # Connection timeout
            sock_read=timeout_seconds-5          # Socket read timeout (leave 5s buffer)
        )
        
        async with aiohttp.ClientSession(connector=connector, timeout=timeout) as session:
            # Run concurrent user sessions
            tasks = [user_requests(session) for _ in range(concurrent_users)]
            user_results = await asyncio.gather(*tasks)
            
            # Flatten results
            all_results = []
            for user_result in user_results:
                all_results.extend(user_result)
                
        return all_results
    
    def analyze_results(self, results: List[BenchmarkResult]) -> Dict[str, Any]:
        """📈 Analyze benchmark results and generate statistics"""
        if not results:
            return {"error": "No results to analyze"}
        
        # Filter successful requests
        successful_results = [r for r in results if r.success]
        failed_results = [r for r in results if not r.success]
        
        # Response time statistics
        response_times = [r.response_time for r in successful_results]
        file_sizes = [r.file_size for r in successful_results if r.file_size > 0]
        
        analysis = {
            "total_requests": len(results),
            "successful_requests": len(successful_results),
            "failed_requests": len(failed_results),
            "success_rate": (len(successful_results) / len(results)) * 100,
            "response_times": {
                "min": min(response_times) if response_times else 0,
                "max": max(response_times) if response_times else 0,
                "mean": statistics.mean(response_times) if response_times else 0,
                "median": statistics.median(response_times) if response_times else 0,
                "std_dev": statistics.stdev(response_times) if len(response_times) > 1 else 0,
                "p95": self._percentile(response_times, 95) if response_times else 0,
                "p99": self._percentile(response_times, 99) if response_times else 0,
            },
            "file_sizes": {
                "min": min(file_sizes) if file_sizes else 0,
                "max": max(file_sizes) if file_sizes else 0,
                "mean": statistics.mean(file_sizes) if file_sizes else 0,
            },
            "errors": {}
        }
        
        # Error analysis
        if failed_results:
            error_counts = {}
            error_messages = {}
            for result in failed_results:
                error_key = f"HTTP_{result.status_code}" if result.status_code > 0 else "Connection/Timeout"
                if error_key in error_counts:
                    error_counts[error_key] += 1
                else:
                    error_counts[error_key] = 1
                    error_messages[error_key] = result.error_message[:100]  # Store sample error message
            
            analysis["errors"] = error_counts
            analysis["error_samples"] = error_messages
        
        return analysis
    
    def _percentile(self, data: List[float], percentile: int) -> float:
        """Calculate percentile of a dataset"""
        if not data:
            return 0
        sorted_data = sorted(data)
        index = (percentile / 100) * (len(sorted_data) - 1)
        if index.is_integer():
            return sorted_data[int(index)]
        else:
            lower = sorted_data[int(index)]
            upper = sorted_data[int(index) + 1]
            return lower + (upper - lower) * (index - int(index))
    
    def print_results(self, analysis: Dict[str, Any], duration: float):
        """🎨 Pretty print benchmark results with emojis"""
        print("\n" + "="*60)
        print("🏆 STASIS PDF GENERATOR BENCHMARK RESULTS")
        print("="*60)
        
        print(f"\n📊 OVERALL STATISTICS")
        print(f"   ⏱️  Total duration: {duration:.2f}s")
        print(f"   📋 Total requests: {analysis['total_requests']}")
        print(f"   ✅ Successful: {analysis['successful_requests']}")
        print(f"   ❌ Failed: {analysis['failed_requests']}")
        print(f"   📈 Success rate: {analysis['success_rate']:.1f}%")
        
        if analysis['successful_requests'] > 0:
            print(f"\n⚡ RESPONSE TIME METRICS (ms)")
            rt = analysis['response_times']
            print(f"   🏃 Min: {rt['min']:.2f}ms")
            print(f"   🐌 Max: {rt['max']:.2f}ms")
            print(f"   📊 Mean: {rt['mean']:.2f}ms")
            print(f"   📍 Median: {rt['median']:.2f}ms")
            print(f"   📐 Std Dev: {rt['std_dev']:.2f}ms")
            print(f"   🎯 95th percentile: {rt['p95']:.2f}ms")
            print(f"   🚀 99th percentile: {rt['p99']:.2f}ms")
            
            # Throughput calculation
            throughput = analysis['successful_requests'] / duration
            print(f"\n🔥 THROUGHPUT")
            print(f"   📈 Requests/second: {throughput:.2f}")
            print(f"   📊 PDFs/minute: {throughput * 60:.1f}")
            
            # File size analysis
            if analysis['file_sizes']['mean'] > 0:
                fs = analysis['file_sizes']
                print(f"\n📄 PDF FILE SIZES")
                print(f"   📏 Min: {fs['min']:,} bytes")
                print(f"   📐 Max: {fs['max']:,} bytes")
                print(f"   📊 Average: {fs['mean']:,.0f} bytes ({fs['mean']/1024:.1f} KB)")
        
        # Error analysis
        if analysis['failed_requests'] > 0:
            print(f"\n💥 ERROR ANALYSIS")
            for error_type, count in analysis['errors'].items():
                print(f"   🚨 {error_type}: {count} occurrences")
                if 'error_samples' in analysis and error_type in analysis['error_samples']:
                    print(f"      📝 Sample: {analysis['error_samples'][error_type]}")
                    
            # Show timeout vs other errors breakdown
            timeout_errors = sum(count for error_type, count in analysis['errors'].items() 
                               if 'Timeout' in error_type or 'Connection' in error_type)
            if timeout_errors > 0:
                print(f"   ⏱️  Timeout/Connection issues: {timeout_errors}/{analysis['failed_requests']} failures")
        
        # Performance assessment
        self._print_performance_assessment(analysis)
        
        print("\n" + "="*60)
    
    def _print_performance_assessment(self, analysis: Dict[str, Any]):
        """🎯 Provide performance assessment based on results"""
        print(f"\n🎯 PERFORMANCE ASSESSMENT")
        
        if analysis['success_rate'] >= 99:
            print("   🟢 Reliability: Excellent")
        elif analysis['success_rate'] >= 95:
            print("   🟡 Reliability: Good")
        else:
            print("   🔴 Reliability: Needs improvement")
        
        if analysis['successful_requests'] > 0:
            mean_time = analysis['response_times']['mean']
            if mean_time < 1000:
                print("   🟢 Response Time: Excellent (<1s)")
            elif mean_time < 3000:
                print("   🟡 Response Time: Good (<3s)")
            elif mean_time < 5000:
                print("   🟠 Response Time: Acceptable (<5s)")
            else:
                print("   🔴 Response Time: Slow (>5s)")
            
            p99_time = analysis['response_times']['p99']
            if p99_time < 2000:
                print("   🟢 Latency (P99): Excellent (<2s)")
            elif p99_time < 5000:
                print("   🟡 Latency (P99): Good (<5s)")
            else:
                print("   🔴 Latency (P99): High (>5s)")


async def main():
    """🎬 Main benchmark execution function"""
    parser = argparse.ArgumentParser(description="Benchmark Stasis PDF Generator")
    parser.add_argument("--url", default="http://localhost:7070", help="Base URL of the service")
    parser.add_argument("--users", type=int, default=5, help="Number of concurrent users")
    parser.add_argument("--requests", type=int, default=10, help="Requests per user")
    parser.add_argument("--timeout", type=int, default=30, help="Request timeout in seconds")
    parser.add_argument("--output", help="Output file for results (JSON)")
    parser.add_argument("--verbose", action="store_true", help="Show individual request results")
    
    args = parser.parse_args()
    
    benchmark = StasisBenchmark(args.url)
    
    print("🔍 Checking service health...")
    if not await benchmark.check_health():
        print("❌ Service is not available. Please start the Stasis service first.")
        return
    
    print(f"\n🎯 Target URL: {args.url}")
    
    # Run benchmark
    start_time = time.time()
    results = await benchmark.concurrent_benchmark(args.users, args.requests, args.timeout)
    end_time = time.time()
    
    duration = end_time - start_time
    analysis = benchmark.analyze_results(results)
    
    # Show individual results if verbose mode
    if args.verbose:
        print(f"\n📋 INDIVIDUAL REQUEST RESULTS:")
        for i, result in enumerate(results[:20], 1):  # Show first 20 results
            status = "✅" if result.success else "❌"
            print(f"   {status} Request #{i}: {result.response_time:.0f}ms, Status: {result.status_code}")
            if not result.success:
                print(f"      Error: {result.error_message}")
        if len(results) > 20:
            print(f"   ... and {len(results) - 20} more results")
    
    # Print results
    benchmark.print_results(analysis, duration)
    
    # Save results if output file specified
    if args.output:
        output_data = {
            "timestamp": datetime.now().isoformat(),
            "configuration": {
                "url": args.url,
                "concurrent_users": args.users,
                "requests_per_user": args.requests,
                "total_requests": args.users * args.requests
            },
            "duration": duration,
            "analysis": analysis
        }
        
        with open(args.output, 'w') as f:
            json.dump(output_data, f, indent=2)
        
        print(f"💾 Results saved to: {args.output}")


if __name__ == "__main__":
    # Check if required packages are available
    try:
        import aiohttp
    except ImportError:
        print("❌ aiohttp is required. Install with: pip install aiohttp")
        exit(1)
    
    print("🚀 Starting Stasis PDF Generator Benchmark...")
    asyncio.run(main())
